const connection = require("../../config/dataBase")

// Importer tous les groupes
exports.afficherGroupes = (req, res) => {
  const query = "SELECT * FROM pkg_group_user"

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err)
      return res.status(500).json({ error: "Database error", success: false })
    }

    // Return empty array instead of error for no groups
    res.json({ groups: results || [], success: true })
  })
}

// Importer tous les plans
exports.afficherPlans = (req, res) => {
  const query = "SELECT * FROM pkg_plan"

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching plans:", err)
      return res.status(500).json({ error: "Database error", success: false })
    }
    // Return empty array instead of error for no plans
    res.json({ plans: results || [], success: true })
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
      return res.status(500).json({ error: "Database error", success: false })
    }
    res.json({ users: results || [], success: true })
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
    if (!username || !password || !id_group || !id_plan) {
      return res.status(400).json({ error: "Missing required fields", success: false });
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
        return res.status(500).json({ error: "Database error occurred", success: false })
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Group not found" })
      }

      const id_group_int = results[0].id
      const getPlanIdQuery = "SELECT id FROM pkg_plan WHERE name = ?"

      connection.query(getPlanIdQuery, [id_plan], (err, planResults) => {
        if (err) {
          console.error("Plan ID Error:", err)
          return res.status(500).json({ error: "Database error occurred", success: false })
        }

        if (planResults.length === 0) {
          return res.status(400).json({ error: "Plan not found" })
        }

        const id_plan_int = planResults[0].id

        const checkUserQuery = "SELECT id FROM pkg_user WHERE username = ?"
        connection.query(checkUserQuery, [username], (err, userResults) => {
          if (err) {
            console.error("User Check Error:", err)
            return res.status(500).json({ error: "Database error occurred", success: false })
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
                  return res.status(500).json({ error: "Database error occurred", success: false })
                }

                const userId = results.insertId

                // Import the SIP user controller
                const { ajouterSIPUser } = require('./SIPUsers');

                // Function to create a single SIP user
                const createSipUser = (index) => {
                  return new Promise((resolve, reject) => {
                    const sipUserData = {
                      id_user: userId,
                      name: `${username}-${String(index + 1).padStart(2, "0")}`,
                      accountcode: `${username}-${String(index + 1).padStart(2, "0")}`,
                      host: 'dynamic',
                      status: '1',
                      callerid: callerid || '',
                      codecs: allow || 'ulaw,alaw,g729,gsm,opus',
                      context: context || 'billing',
                      dtmfmode: 'RFC2833',
                      type: 'friend',
                      nat: 'force_rport,comedia',
                      qualify: 'yes', // Explicitly set to 'yes' as default
                      directmedia: 'no',
                      disallow: disallow || 'all',
                      allowtransfer: 'no',
                      password: password, // Pass the user's password
                      // Add other required fields with defaults
                      block_call_reg: 'no',
                      record_call: 'no',
                      techprefix: '0',
                      insecure: 'no',
                      deny: '',
                      permit: ''
                    };

                    // Create mock request and response objects
                    const mockReq = { body: sipUserData };
                    const mockRes = {
                      status: (code) => ({
                        json: (data) => {
                          if (code >= 400) {
                            reject(new Error(`Error creating SIP user ${index + 1}: ${JSON.stringify(data)}`));
                          } else {
                            resolve(data);
                          }
                        }
                      })
                    };

                    // Call the ajouterSIPUser function
                    ajouterSIPUser(mockReq, mockRes);
                  });
                };


                // Create SIP users one by one
                const createSipUsers = async () => {
                  const sipCount = Number(numberOfSipUsers) || 0;
                  for (let i = 0; i < sipCount; i++) {
                    await createSipUser(i);
                  }
                  return sipCount;
                };

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
                ]);

                console.log("IAX Users to insert:", iaxUsers); // Debugging log

                // Execute operations in sequence
                (async () => {
                  try {
                    // Create SIP users if needed
                    const sipCount = await createSipUsers();
                    
                    // Insert IAX users if any
                    if (iaxUsers.length > 0) {
                      const insertIAXQuery = `
                      INSERT INTO pkg_iax (
                        id_user, name, accountcode, host, allow, regexten,
                        callerid, context, fromuser, fromdomain, insecure,
                        mailbox, md5secret, permit, secret, username, disallow, deny
                      ) VALUES ?`;

                      await new Promise((resolve, reject) => {
                        connection.query(insertIAXQuery, [iaxUsers], (err) => {
                          if (err) {
                            console.error("IAX Insert Error:", err);
                            return reject(new Error("Error creating IAX users"));
                          }
                          resolve();
                        });
                      });
                    }


                    // If we get here, everything was successful
                    res.status(201).json({
                      message: `User created successfully with ${sipCount} SIP account(s) and ${iaxUsers.length} IAX account(s)`,
                      userId: userId,
                      success: true
                    });

                  } catch (error) {
                    console.error("Error creating user accounts:", error);
                    res.status(500).json({
                      error: error.message || "Error creating user accounts",
                      success: false
                    });
                  }
                })();
              })
            })
            .catch((err) => {
              console.error("PIN Generation Error:", err)
              return res.status(500).json({ error: "Database error occurred", success: false })
            })
        })
      })
    })
  } catch (error) {
    console.error("Unexpected error in ajouterUtilisateur:", error)
    return res.status(500).json({ error: "An unexpected error occurred", success: false })
  }
}

// Supprimer un utilisateur
exports.supprimerUtilisateur = (req, res) => {
  const { id } = req.params;
  const userId = Number(id);

  // Vérifier si l'ID est valide
  if (isNaN(userId) || userId <= 0) {
    console.error("ID utilisateur invalide :", id);
    return res.status(400).json({ error: "Invalid user ID", success: false });
  }

  console.log(`Tentative de suppression de l'utilisateur avec l'ID : ${userId}`);

  // Vérifier si l'utilisateur existe
  const checkUserQuery = "SELECT * FROM pkg_user WHERE id = ?";
  connection.query(checkUserQuery, [userId], (checkErr, results) => {
    if (checkErr) {
      console.error("Erreur lors de la vérification de l'existence de l'utilisateur :", checkErr);
      return res.status(500).json({ error: "Database error occurred", success: false });
    }
    if (results.length === 0) {
      console.warn("Utilisateur non trouvé pour l'ID :", userId);
      return res.status(404).json({ error: "User not found", success: false });
    }

    // Fonction pour supprimer les entrées IAX d'un utilisateur
    const deleteIaxEntries = (callback) => {
      const deleteIaxQuery = "DELETE FROM pkg_iax WHERE id_user = ?";
      connection.query(deleteIaxQuery, [userId], (err, result) => {
        if (err) {
          console.error(`Erreur lors de la suppression des entrées IAX pour l'utilisateur ${userId}:`, err);
          return callback({
            type: 'IAX_DELETE_ERROR',
            message: 'Failed to delete IAX entries',
            error: err
          });
        }
        console.log(`Suppression de ${result.affectedRows} entrée(s) IAX pour l'utilisateur ${userId}`);
        callback(null);
      });
    };

    // Fonction pour supprimer les utilisateurs SIP d'un utilisateur
    const deleteSipUsers = (callback) => {
      const deleteSipQuery = "DELETE FROM pkg_sip WHERE id_user = ?";
      connection.query(deleteSipQuery, [userId], (err, result) => {
        if (err) {
          console.error(`Erreur lors de la suppression des utilisateurs SIP pour l'utilisateur ${userId}:`, err);
          return callback({
            type: 'SIP_DELETE_ERROR',
            message: 'Failed to delete SIP users',
            error: err
          });
        }
        console.log(`Suppression de ${result.affectedRows} utilisateur(s) SIP pour l'utilisateur ${userId}`);
        callback(null);
      });
    };

    // Fonction pour supprimer les entrées IVR d'un utilisateur
    const deleteIvrEntries = (callback) => {
      const deleteIvrQuery = "DELETE FROM pkg_ivr WHERE id_user = ?";
      connection.query(deleteIvrQuery, [userId], (err, result) => {
        if (err) {
          console.error(`Erreur lors de la suppression des entrées IVR pour l'utilisateur ${userId}:`, err);
          return callback({
            type: 'IVR_DELETE_ERROR',
            message: 'Failed to delete IVR entries',
            error: err
          });
        }
        console.log(`Suppression de ${result.affectedRows} entrée(s) IVR pour l'utilisateur ${userId}`);
        callback(null);
      });
    };

    // Vérifier s'il y a des enregistrements DID liés
    const checkDidQuery = "SELECT COUNT(*) AS count FROM pkg_did WHERE id_user = ?";
    connection.query(checkDidQuery, [userId], (didErr, didResults) => {
      if (didErr) {
        console.error("Erreur lors de la vérification des enregistrements DID :", didErr);
        return res.status(500).json({ 
          error: "Database error checking DID records", 
          success: false,
          details: didErr.message 
        });
      }

      if (!didResults || didResults.length === 0) {
        console.error("Unexpected result when checking DID records:", didResults);
        return res.status(500).json({ 
          error: "Unexpected database response when checking DID records", 
          success: false 
        });
      }

      const didCount = didResults[0]?.count || 0;
      if (didCount > 0) {
        console.log(`User ${userId} has ${didCount} associated DID records`);
        return res.status(400).json({ 
          error: "Cannot delete user with active DID records. Please remove all associated DIDs first.", 
          success: false 
        });
      }

      // Supprimer d'abord les entrées IAX, puis les utilisateurs SIP, puis les IVR, puis l'utilisateur
      deleteIaxEntries((iaxErr) => {
        if (iaxErr) {
          console.error(`Erreur lors de la suppression des entrées IAX:`, iaxErr.error);
          return res.status(500).json({ 
            error: "Error deleting IAX entries: " + (iaxErr.error?.message || 'Unknown error'), 
            success: false,
            errorType: iaxErr.type || 'UNKNOWN_ERROR'
          });
        }

        deleteSipUsers((sipErr) => {
          if (sipErr) {
            console.error(`Erreur lors de la suppression des utilisateurs SIP:`, sipErr.error);
            return res.status(500).json({ 
              error: "Error deleting SIP users: " + (sipErr.error?.message || 'Unknown error'), 
              success: false,
              errorType: sipErr.type || 'UNKNOWN_ERROR'
            });
          }

          // Supprimer les entrées IVR avant de supprimer l'utilisateur
          deleteIvrEntries((ivrErr) => {
            if (ivrErr) {
              console.error(`Erreur lors de la suppression des entrées IVR:`, ivrErr.error);
              return res.status(500).json({ 
                error: "Error deleting IVR entries: " + (ivrErr.error?.message || 'Unknown error'), 
                success: false,
                errorType: ivrErr.type || 'UNKNOWN_ERROR'
              });
            }

            // Maintenant, supprimer l'utilisateur
            const deleteUserQuery = "DELETE FROM pkg_user WHERE id = ?";
            connection.query(deleteUserQuery, [userId], (userErr, result) => {
            if (userErr) {
              console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, userErr);
              return res.status(500).json({ 
                error: "Failed to delete user: " + (userErr.message || 'Database error'), 
                success: false,
                errorType: 'USER_DELETE_ERROR',
                details: userErr.sqlMessage || 'Unknown database error'
              });
            }

            if (result.affectedRows === 0) {
              console.warn(`Aucun utilisateur trouvé avec l'ID ${userId} pour suppression`);
              return res.status(404).json({ 
                error: "User not found or already deleted", 
                success: false 
              });
            }

            console.log(`Utilisateur ${userId} et toutes ses données associées supprimés avec succès.`);
            res.status(200).json({ 
              success: true,
              message: `User ${userId} and all associated data deleted successfully`,
              userId: userId
            });
          });
        });
      });
    });
    });
  });
};

// Modifier un utilisateur
exports.modifierUtilisateur = (req, res) => {
  try {
    const userId = req.params.id;

    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("Invalid user ID:", userId);
      return res.status(400).json({ error: "Invalid user ID", success: false });
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
    console.log("Active value received:", active, "Type:", typeof active);

    const checkUserQuery = "SELECT * FROM pkg_user WHERE id = ?";
    connection.query(checkUserQuery, [Number(userId)], (checkErr, results) => {
      if (checkErr) {
        console.error("Error checking user existence:", checkErr);
        return res.status(500).json({ error: "Database error occurred", success: false });
      }

      if (results.length === 0) {
        console.warn("User not found for ID:", userId);
        return res.status(404).json({ error: "User not found", success: false });
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
        // Convert string 'Active'/'Inactive' to 1/0, or use the numeric value directly
        const activeValue = typeof active === 'string' 
          ? (active.toLowerCase() === 'active' ? 1 : 0)
          : Number(active);
        queryParams.push(activeValue);
      }

      // Include other fields similarly...

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update", success: false });
      }

      queryParams.push(Number(userId));
      const query = `UPDATE pkg_user SET ${updateFields.join(", ")} WHERE id = ?`;

      console.log("Update query:", query);
      console.log("Update params:", queryParams);

      connection.query(query, queryParams, (error, results) => {
        if (error) {
          console.error("Error updating database:", error);
          return res.status(500).json({ error: "Database error occurred", success: false });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found or no changes made", success: false });
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
    return res.status(500).json({ error: "An unexpected error occurred", success: false });
  }
};


// Get a single user with all details
exports.getUtilisateur = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "Invalid user ID", success: false })
    }

    // First, get the user's password from the database
    const passwordQuery = `SELECT password FROM pkg_user WHERE id = ?`;
    
    connection.query(passwordQuery, [userId], (passwordErr, passwordResults) => {
      if (passwordErr) {
        console.error("Error fetching user password:", passwordErr);
        return res.status(500).json({ error: "Database error occurred", success: false });
      }
      
      const userPassword = passwordResults.length > 0 ? passwordResults[0].password : null;
      
      // Then get all other user data
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
      `;

      connection.query(query, [userId], (err, results) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ error: "Database error occurred", success: false });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found", success: false });
        }
        
        // Add the password to the user object
        const user = results[0];
        user.password = userPassword;
        
        res.json({ user });
      });
    });
  } catch (error) {
    console.error("Unexpected error in getUtilisateur:", error);
    return res.status(500).json({ error: "An unexpected error occurred", success: false });
  }
}

// Get SIP accounts for a user
exports.getUserSipAccounts = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "Invalid user ID", success: false })
    }

    const query = `
      SELECT * FROM pkg_sip 
      WHERE id_user = ?
      ORDER BY name ASC
    `

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching SIP accounts:", err)
        return res.status(500).json({ error: "Database error occurred", success: false })
      }

      res.json({ sipAccounts: results || [] });
    })
  } catch (error) {
    console.error("Unexpected error in getUserSipAccounts:", error)
    return res.status(500).json({ error: "An unexpected error occurred", success: false })
  }
}

// Update user credit
exports.updateCredit = (req, res) => {
  const userId = req.params.id;
  const { credit } = req.body;

  if (typeof credit === 'undefined') {
    return res.status(400).json({ error: 'Credit value is required', success: false });
  }

  const query = 'UPDATE pkg_user SET credit = ? WHERE id = ?';
  
  connection.query(query, [credit, userId], (err, result) => {
    if (err) {
      console.error('Error updating credit:', err);
      return res.status(500).json({ error: 'Database error occurred', success: false });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found', success: false });
    }

    res.json({ success: true, message: 'Credit updated successfully' });
  });
};

// Get IAX accounts for a user
exports.getUserIaxAccounts = (req, res) => {
  try {
    const userId = req.params.id

    // Vérifier si l'ID est valide
    if (isNaN(userId) || Number(userId) <= 0) {
      console.error("ID utilisateur invalide :", userId)
      return res.status(400).json({ error: "Invalid user ID", success: false })
    }

    const query = `
      SELECT * FROM pkg_iax
      WHERE id_user = ?
      ORDER BY name ASC
    `

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching IAX accounts:", err)
        return res.status(500).json({ error: "Database error occurred", success: false })
      }

      res.json({ iaxAccounts: results || [] });
    })
  } catch (error) {
    console.error("Unexpected error in getUserIaxAccounts:", error)
    return res.status(500).json({ error: "An unexpected error occurred", success: false })
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