const connection = require("../../config/dataBase")

// Importer tous les groupes
exports.afficherGroupes = (req, res) => {
  const query = "SELECT * FROM pkg_group_user"

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No groups found" })
    }

    res.json({ groups: results })
  })
}

// Importer tous les plans
exports.afficherPlans = (req, res) => {
  const query = "SELECT * FROM pkg_plan"

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching plans:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No plans found" })
    }

    res.json({ plans: results })
  })
}

// Afficher tous les utilisateurs avec leurs informations associées
exports.afficherUtilisateurs = (req, res) => {
  const query = `
    SELECT 
      u.*, 
      g.name AS group_name, 
      p.name AS plan_name, 
      cu.username AS agent,
      (SELECT COUNT(*) FROM pkg_sip s WHERE s.id_user = u.id) AS sip_count,
      (SELECT COUNT(*) FROM pkg_iax i WHERE i.id_user = u.id) AS iax_count
    FROM pkg_user u
    LEFT JOIN pkg_group_user g ON u.id_group = g.id
    LEFT JOIN pkg_plan p ON u.id_plan = p.id
    LEFT JOIN pkg_user cu ON u.id_user = cu.id
    ORDER BY u.id DESC
  `

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      return res.status(500).json({ error: "Database error" })
    }

    // Return empty array instead of 404 for no users
    res.json({ users: results || [] })
  })
}

// Générer un PIN unique
const generateUniquePin = () => {
  return new Promise((resolve, reject) => {
    const checkPinQuery = "SELECT COUNT(*) AS count FROM pkg_user WHERE callingcard_pin = ?"

    // Maximum attempts to prevent infinite recursion
    let attempts = 0
    const maxAttempts = 10

    const generatePin = () => {
      if (attempts >= maxAttempts) {
        return reject(new Error("Failed to generate a unique PIN after multiple attempts"))
      }

      attempts++
      const pin = Math.floor(100000 + Math.random() * 900000)
      connection.query(checkPinQuery, [pin], (err, results) => {
        if (err) {
          reject(err)
          return
        }

        if (results[0].count > 0) {
          generatePin()
        } else {
          resolve(pin)
        }
      })
    }

    generatePin()
  })
}

// Ajouter un utilisateur
exports.ajouterUtilisateur = (req, res) => {
  try {
    const {
      username,
      password,
      id_group,
      id_plan,
      language,
      active,
      numberOfSipUsers,
      numberOfIax,
      callerid,
      context,
      fromuser,
      fromdomain,
      insecure,
      mailbox,
      md5secret,
      permit,
      secret,
      allow,
      disallow,
      deny,
      email,
      firstname,
      city,
      address,
      neighborhood,
      zip_code,
      phone,
      mobile,
      email2,
      doc,
      vat,
      contract_value,
      description,
    } = req.body

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    if (!id_group) {
      return res.status(400).json({ error: "Group is required" })
    }

    if (!id_plan) {
      return res.status(400).json({ error: "Plan is required" })
    }

    console.log("Number of SIP Users:", numberOfSipUsers) // Debugging log

    const getGroupIdQuery = "SELECT id FROM pkg_group_user WHERE id = ?"
    connection.query(getGroupIdQuery, [Number(id_group)], (err, results) => {
      if (err) {
        console.error("Group ID Error:", err)
        return res.status(500).json({ error: "Database error for group ID" })
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Group not found" })
      }

      const id_group_int = results[0].id
      const getPlanIdQuery = "SELECT id FROM pkg_plan WHERE name = ?"

      connection.query(getPlanIdQuery, [id_plan], (err, planResults) => {
        if (err) {
          console.error("Plan ID Error:", err)
          return res.status(500).json({ error: "Database error for plan" })
        }

        if (planResults.length === 0) {
          return res.status(400).json({ error: "Plan not found" })
        }

        const id_plan_int = planResults[0].id

        const checkUserQuery = "SELECT id FROM pkg_user WHERE username = ?"
        connection.query(checkUserQuery, [username], (err, userResults) => {
          if (err) {
            console.error("User Check Error:", err)
            return res.status(500).json({ error: "Error checking user" })
          }

          if (userResults.length > 0) {
            return res.status(400).json({ error: "User already exists" })
          }

          generateUniquePin()
            .then((callingcard_pin) => {
              const userData = {
                id_user: 1,
                id_group: id_group_int,
                id_group_agent: null,
                id_plan: id_plan_int,
                username,
                password,
                active: active || 1,
                language: language || "en",
                callingcard_pin,
                email,
                firstname,
                city,
                address,
                neighborhood,
                zip_code,
                phone,
                mobile,
                email2,
                doc,
                vat,
                contract_value,
                description,
              }

              // Remove undefined fields
              Object.keys(userData).forEach((key) => {
                if (userData[key] === undefined) {
                  delete userData[key]
                }
              })

              const insertUserQuery = "INSERT INTO pkg_user SET ?"
              connection.query(insertUserQuery, userData, (err, results) => {
                if (err) {
                  console.error("User Insert Error:", err)
                  return res.status(500).json({ error: "Error inserting user" })
                }

                const userId = results.insertId

                // Create SIP users with minimal required fields
                const sipUsers = Array.from({ length: Number(numberOfSipUsers) || 0 }, (_, i) => [
                  userId, // id_user
                  `${username}-${String(i + 1).padStart(2, "0")}`, // name
                  `${username}-${String(i + 1).padStart(2, "0")}`, // accountcode
                  "dynamic", // host
                  allow || null, // allow
                  null, // alias
                  null, // regexten
                  null, // amaflags
                  null, // callcounter
                  null, // busylevel
                  null, // allowoverlap
                  null, // allowsubscribe
                  "no", // videosupport
                  null, // callgroup
                  callerid || "default_callerid", // callerid
                  context || "default_context", // context
                  null, // DEFAULTip
                  "RFC2833", // dtmfmode
                  fromuser || "default_fromuser", // fromdomain || "default_fromdomain", // fromdomain
                  insecure || "default_insecure", // insecure
                  language || "en", // language
                  mailbox || "default_mailbox", // mailbox
                  null, // session-timers
                  null, // session-expires
                  null, // session-minse
                  null, // session-refresher
                  null, // t38pt_usertpsource
                  md5secret || "default_md5secret", // md5secret
                  "force_rport,comedia", // nat
                  deny || "default_deny", // deny
                  permit || "default_permit", // permit
                  null, // pickupgroup
                  null, // port
                  "yes", // qualify
                  null, // rtptimeout
                  null, // rtpholdtimeout
                  secret || "default_secret", // secret
                  "friend", // type
                  disallow || "all", // disallow
                  0, // regseconds
                  null, // ipaddr
                  null, // fullcontact
                  null, // setvar
                  null, // regserver
                  null, // lastms
                  username, // defaultuser
                  null, // auth
                  null, // subscribemwi
                  null, // vmexten
                  null, // cid_number
                  null, // callingpres
                  null, // usereqphone
                  null, // mohsuggest
                  "no", // allowtransfer
                  null, // autoframing
                  null, // maxcallbitrate
                  null, // rfc2833compensate
                  null, // outboundproxy
                  null, // rtpkeepalive
                  null, // useragent
                  null, // calllimit
                  1, // status
                  "no", // directmedia
                  null, // sippasswd
                  null, // callshopnumber
                  0, // callshoptime
                  null, // callbackextension
                  null, // sip_group
                  0, // ringfalse
                  0, // record_call
                  0, // voicemail
                  null, // voicemail_email
                  null, // voicemail_password
                  "", // forward
                  null, // url_events
                  "", // block_call_reg
                  60, // dial_timeout
                  null, // techprefix
                  0, // trace
                  "", // addparameter
                  0, // amd
                  null, // sip_config
                  null, // description
                  null, // id_trunk_group
                  "", // cnl
                ])

                console.log("SIP Users to insert:", sipUsers) // Debugging log

                // Create IAX users
                const iaxUsers = Array.from({ length: Number(numberOfIax) || 0 }, (_, i) => [
                  userId,
                  `${username}-${String(i + 1).padStart(2, "0")}`,
                  `${username}-${String(i + 1).padStart(2, "0")}`,
                  "dynamic",
                  "all",
                  "",
                  callerid || "default_callerid",
                  context || "default_context",
                  fromuser || "default_fromuser",
                  fromdomain || "default_fromdomain",
                  insecure || "default_insecure",
                  mailbox || "default_mailbox",
                  md5secret || "default_md5secret",
                  permit || "default_permit",
                  secret || "default_secret",
                  username || "default_username",
                  disallow || "default_disallow",
                  deny || "default_deny",
                ])

                console.log("IAX Users to insert:", iaxUsers) // Debugging log

                // Insert SIP users
                if (sipUsers.length > 0) {
                  const insertSIPQuery = `
                  INSERT INTO pkg_sip (
                    id_user, name, accountcode, host, allow,
                    alias, regexten, amaflags, callcounter, busylevel,
                    allowoverlap, allowsubscribe, videosupport, callgroup,
                    callerid, context, DEFAULTip, dtmfmode, fromuser, fromdomain,
                    insecure, language, mailbox, \`session-timers\`, \`session-expires\`,
                    \`session-minse\`, \`session-refresher\`, t38pt_usertpsource, md5secret, nat,
                    deny, permit, pickupgroup, port, qualify,
                    rtptimeout, rtpholdtimeout, secret, type, disallow,
                    regseconds, ipaddr, fullcontact, setvar, regserver,
                    lastms, defaultuser, auth, subscribemwi, vmexten,
                    cid_number, callingpres, usereqphone, mohsuggest, allowtransfer,
                    autoframing, maxcallbitrate, rfc2833compensate, outboundproxy, rtpkeepalive,
                    useragent, calllimit, status, directmedia, sippasswd,
                    callshopnumber, callshoptime, callbackextension, sip_group, ringfalse,
                    record_call, voicemail, voicemail_email, voicemail_password, forward,
                    url_events, block_call_reg, dial_timeout, techprefix, trace,
                    addparameter, amd, sip_config, description, id_trunk_group,
                    cnl
                  ) VALUES ?`

                  connection.query(insertSIPQuery, [sipUsers], (err) => {
                    if (err) {
                      console.error("SIP Insert Error:", err)
                      return res.status(500).json({ error: "Error creating SIP users" })
                    }

                    // Insert IAX users if any
                    if (iaxUsers.length > 0) {
                      const insertIAXQuery = `
                      INSERT INTO pkg_iax (
                        id_user, name, accountcode, host, allow, regexten,
                        callerid, context, fromuser, fromdomain, insecure,
                        mailbox, md5secret, permit, secret, username, disallow, deny
                      ) VALUES ?`

                      connection.query(insertIAXQuery, [iaxUsers], (err) => {
                        if (err) {
                          console.error("IAX Insert Error:", err)
                          return res.status(500).json({ error: "Error creating IAX users" })
                        }

                        res.status(201).json({
                          message: "User, SIP, and IAX users added successfully",
                          userId: userId,
                        })
                      })
                    } else {
                      res.status(201).json({
                        message: "User and SIP users added successfully",
                        userId: userId,
                      })
                    }
                  })
                } else {
                  // Handle case with no SIP users
                  if (iaxUsers.length > 0) {
                    const insertIAXQuery = `
                    INSERT INTO pkg_iax (
                      id_user, name, accountcode, host, allow, regexten,
                      callerid, context, fromuser, fromdomain, insecure,
                      mailbox, md5secret, permit, secret, username, disallow, deny
                    ) VALUES ?`

                    connection.query(insertIAXQuery, [iaxUsers], (err) => {
                      if (err) {
                        console.error("IAX Insert Error:", err)
                        return res.status(500).json({ error: "Error creating IAX users" })
                      }

                      res.status(201).json({
                        message: "User added without SIP",
                        userId: userId,
                      })
                    })
                  } else {
                    res.status(201).json({
                      message: "User added without SIP or IAX",
                      userId: userId,
                    })
                  }
                }
              })
            })
            .catch((err) => {
              console.error("PIN Generation Error:", err)
              return res.status(500).json({ error: "Error generating unique PIN" })
            })
        })
      })
    })
  } catch (error) {
    console.error("Unexpected error in ajouterUtilisateur:", error)
    return res.status(500).json({ error: "An unexpected error occurred" })
  }
}

// Supprimer un utilisateur - Version simplifiée qui ne supprime que l'utilisateur
exports.supprimerUtilisateur = (req, res) => {
  const { id } = req.params

  // Vérifier si l'ID est valide
  if (isNaN(id) || Number(id) <= 0) {
    console.error("ID utilisateur invalide :", id)
    return res.status(400).json({ error: "ID utilisateur invalide" })
  }

  console.log(`Tentative de suppression de l'utilisateur avec l'ID : ${id}`)

  // Vérifier si l'utilisateur existe
  const checkUserQuery = "SELECT * FROM pkg_user WHERE id = ?"
  connection.query(checkUserQuery, [Number(id)], (checkErr, results) => {
    if (checkErr) {
      console.error("Erreur lors de la vérification de l'existence de l'utilisateur :", checkErr)
      return res.status(500).json({ error: "Erreur serveur" })
    }
    if (results.length === 0) {
      console.warn("Utilisateur non trouvé pour l'ID :", id)
      return res.status(404).json({ error: "Utilisateur non trouvé" })
    }

    // Supprimer d'abord les enregistrements SIP liés
    const deleteSipQuery = "DELETE FROM pkg_sip WHERE id_user = ?"
    connection.query(deleteSipQuery, [Number(id)], (sipErr) => {
      if (sipErr) {
        console.error("Erreur lors de la suppression des enregistrements SIP :", sipErr)
        return res.status(500).json({ error: "Erreur lors de la suppression des enregistrements SIP" })
      }
      console.log("Enregistrements SIP supprimés avec succès.")

      // Supprimer ensuite les enregistrements IAX liés
      const deleteIaxQuery = "DELETE FROM pkg_iax WHERE id_user = ?"
      connection.query(deleteIaxQuery, [Number(id)], (iaxErr) => {
        if (iaxErr) {
          console.error("Erreur lors de la suppression des enregistrements IAX :", iaxErr)
          return res.status(500).json({ error: "Erreur lors de la suppression des enregistrements IAX" })
        }
        console.log("Enregistrements IAX supprimés avec succès.")

        // Supprimer les enregistrements dans pkg_did_destination
        const deleteDidDestinationQuery = "DELETE FROM pkg_did_destination WHERE id_user = ?"
        connection.query(deleteDidDestinationQuery, [Number(id)], (didDestErr) => {
          if (didDestErr) {
            console.error("Erreur lors de la suppression des enregistrements pkg_did_destination :", didDestErr)
            return res.status(500).json({ error: "Erreur lors de la suppression des enregistrements liés" })
          }
          console.log("Enregistrements pkg_did_destination supprimés avec succès.")

          // Supprimer les enregistrements dans pkg_ivr
          const deleteIvrQuery = "DELETE FROM pkg_ivr WHERE id_user = ?"
          connection.query(deleteIvrQuery, [Number(id)], (ivrErr) => {
            if (ivrErr) {
              console.error("Erreur lors de la suppression des enregistrements pkg_ivr :", ivrErr)
              return res.status(500).json({ error: "Erreur lors de la suppression des enregistrements IVR" })
            }
            console.log("Enregistrements pkg_ivr supprimés avec succès.")

            // Supprimer les enregistrements dans pkg_campaign_phonebook
            const deleteCampaignPhonebookQuery = "DELETE FROM pkg_campaign_phonebook WHERE id_user = ?"
            connection.query(deleteCampaignPhonebookQuery, [Number(id)], (campaignErr) => {
              if (campaignErr) {
                console.error("Erreur lors de la suppression des enregistrements pkg_campaign_phonebook :", campaignErr)
                // Continue même en cas d'erreur
              }

              // Supprimer les enregistrements dans pkg_did
              const deleteDidQuery = "DELETE FROM pkg_did WHERE id_user = ?"
              connection.query(deleteDidQuery, [Number(id)], (didErr) => {
                if (didErr) {
                  console.error("Erreur lors de la suppression des enregistrements pkg_did :", didErr)
                  // Continue même en cas d'erreur
                }

                // Supprimer les enregistrements dans pkg_rate_agent
                const deleteRateAgentQuery = "DELETE FROM pkg_rate_agent WHERE id_user = ?"
                connection.query(deleteRateAgentQuery, [Number(id)], (rateErr) => {
                  if (rateErr) {
                    console.error("Erreur lors de la suppression des enregistrements pkg_rate_agent :", rateErr)
                    // Continue même en cas d'erreur
                  }

                  // Supprimer les enregistrements dans pkg_refill
                  const deleteRefillQuery = "DELETE FROM pkg_refill WHERE id_user = ?"
                  connection.query(deleteRefillQuery, [Number(id)], (refillErr) => {
                    if (refillErr) {
                      console.error("Erreur lors de la suppression des enregistrements pkg_refill :", refillErr)
                      // Continue même en cas d'erreur
                    }

                    // Supprimer les enregistrements dans pkg_trunk
                    const deleteTrunkQuery = "DELETE FROM pkg_trunk WHERE id_user = ?"
                    connection.query(deleteTrunkQuery, [Number(id)], (trunkErr) => {
                      if (trunkErr) {
                        console.error("Erreur lors de la suppression des enregistrements pkg_trunk :", trunkErr)
                        // Continue même en cas d'erreur
                      }

                      // Enfin, supprimer l'utilisateur
                      const deleteUserQuery = "DELETE FROM pkg_user WHERE id = ?"
                      connection.query(deleteUserQuery, [Number(id)], (userErr) => {
                        if (userErr) {
                          console.error("Erreur lors de la suppression de l'utilisateur :", userErr)
                          return res.status(500).json({
                            error: "Erreur lors de la suppression de l'utilisateur",
                            details: userErr.sqlMessage,
                          })
                        }

                        console.log("Utilisateur supprimé avec succès.")
                        res.status(200).json({ message: "Utilisateur et enregistrements liés supprimés avec succès" })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

// Modifier un utilisateur
exports.modifierUtilisateur = (req, res) => {
  try {
    const userId = req.params.id;

    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("Invalid user ID:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const {
      username,
      password,
      id_group,
      id_plan,
      language,
      active,
      email,
      firstname,
      city,
      address,
      neighborhood,
      zip_code,
      phone,
      mobile,
      email2,
      doc,
      vat,
      contract_value,
      description,
    } = req.body;

    console.log("Update request body:", req.body);

    const checkUserQuery = "SELECT * FROM pkg_user WHERE id = ?";
    connection.query(checkUserQuery, [Number(userId)], (checkErr, results) => {
      if (checkErr) {
        console.error("Error checking user existence:", checkErr);
        return res.status(500).json({ error: "Server error during verification" });
      }

      if (results.length === 0) {
        console.warn("User not found for ID:", userId);
        return res.status(404).json({ error: "User not found" });
      }

      const updateFields = [];
      const queryParams = [];

      if (username !== undefined) {
        updateFields.push("username = ?");
        queryParams.push(username);
      }

      if (password) {
        updateFields.push("password = ?");
        queryParams.push(password);
      }

      if (id_group) {
        updateFields.push("id_group = ?");
        queryParams.push(id_group);
      }

      if (id_plan) {
        updateFields.push("id_plan = ?");
        queryParams.push(id_plan);
      }

      if (language) {
        updateFields.push("language = ?");
        queryParams.push(language);
      }

      if (active !== undefined) {
        updateFields.push("active = ?");
        queryParams.push(Number(active));
      }

      // Include other fields similarly...

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      queryParams.push(Number(userId));
      const query = `UPDATE pkg_user SET ${updateFields.join(", ")} WHERE id = ?`;

      console.log("Update query:", query);
      console.log("Update params:", queryParams);

      connection.query(query, queryParams, (error, results) => {
        if (error) {
          console.error("Error updating database:", error);
          return res.status(500).json({ error: "Database error", details: error.message });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found or no changes made" });
        }

        res.status(200).json({
          message: "User updated successfully",
          updatedFields: updateFields.length,
          userId: userId,
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error in modifierUtilisateur:", error);
    return res.status(500).json({ error: "An unexpected error occurred", details: error.message });
  }
};


// Get a single user with all details
exports.getUtilisateur = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "ID utilisateur invalide" })
    }

    const query = `
      SELECT 
        u.*, 
        g.name AS group_name, 
        p.name AS plan_name, 
        cu.username AS agent,
        (SELECT COUNT(*) FROM pkg_sip s WHERE s.id_user = u.id) AS sip_count,
        (SELECT COUNT(*) FROM pkg_iax i WHERE i.id_user = u.id) AS iax_count
      FROM pkg_user u
      LEFT JOIN pkg_group_user g ON u.id_group = g.id
      LEFT JOIN pkg_plan p ON u.id_plan = p.id
      LEFT JOIN pkg_user cu ON u.id_user = cu.id
      WHERE u.id = ?
    `

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user:", err)
        return res.status(500).json({ error: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }

      res.json({ user: results[0] })
    })
  } catch (error) {
    console.error("Unexpected error in getUtilisateur:", error)
    return res.status(500).json({ error: "An unexpected error occurred" })
  }
}

// Get SIP accounts for a user
exports.getUserSipAccounts = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "ID utilisateur invalide" })
    }

    const query = `
      SELECT * FROM pkg_sip 
      WHERE id_user = ?
      ORDER BY name ASC
    `

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching SIP accounts:", err)
        return res.status(500).json({ error: "Database error" })
      }

      res.json({ sipAccounts: results || [] })
    })
  } catch (error) {
    console.error("Unexpected error in getUserSipAccounts:", error)
    return res.status(500).json({ error: "An unexpected error occurred" })
  }
}

// Get IAX accounts for a user
exports.getUserIaxAccounts = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "ID utilisateur invalide" })
    }

    const query = `
      SELECT * FROM pkg_iax
      WHERE id_user = ?
      ORDER BY name ASC
    `

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching IAX accounts:", err)
        return res.status(500).json({ error: "Database error" })
      }

      res.json({ iaxAccounts: results || [] })
    })
  } catch (error) {
    console.error("Unexpected error in getUserIaxAccounts:", error)
    return res.status(500).json({ error: "An unexpected error occurred" })
  }
}


exports.getUserPassword = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "ID utilisateur invalide" })
    }

    const query = "SELECT password FROM pkg_user WHERE id = ?"

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération du mot de passe:", err)
        return res.status(500).json({ error: "Erreur de base de données" })
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" })
      }

      res.json({ password: results[0].password })
    })
  } catch (error) {
    console.error("Erreur inattendue dans getUserPassword:", error)
    return res.status(500).json({ error: "Une erreur inattendue s'est produite" })
  }
}