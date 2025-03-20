const connection = require("../../config/dataBase");

// Importer tous les groupes
exports.afficherGroupes = (req, res) => {
  const query = "SELECT * FROM pkg_group_user";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No groups found" });
    }

    res.json({ groups: results });
  });
};

// Importer tous les plans
exports.afficherPlans = (req, res) => {
  const query = "SELECT * FROM pkg_plan";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching plans:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No plans found" });
    }

    res.json({ plans: results });
  });
};

// Afficher tous les utilisateurs avec leurs informations associées (groupe, plan, agent, and sip count)
exports.afficherUtilisateurs = (req, res) => {
  const query = `
    SELECT 
      u.*, 
      g.name AS group_name, 
      p.name AS plan_name, 
      cu.username AS agent,
      (SELECT COUNT(*) FROM pkg_sip s WHERE s.id_user = u.id) AS sip_count
    FROM pkg_user u
    LEFT JOIN pkg_group_user g ON u.id_group = g.id
    LEFT JOIN pkg_plan p ON u.id_plan = p.id
    LEFT JOIN pkg_user cu ON u.id_user = cu.id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json({ users: results });
  });
};

const generateUniquePin = () => {
  return new Promise((resolve, reject) => {
    let pin;
    const checkPinQuery = "SELECT COUNT(*) AS count FROM pkg_user WHERE callingcard_pin = ?";

    const generatePin = () => {
      pin = Math.floor(100000 + Math.random() * 900000);
      connection.query(checkPinQuery, [pin], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results[0].count > 0) {
          generatePin();
        } else {
          resolve(pin);
        }
      });
    };

    generatePin();
  });
};

exports.ajouterUtilisateur = (req, res) => {
  console.log("Request Body:", req.body);
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
    deny // Add deny to the destructured request body
  } = req.body;

  const getGroupIdQuery = "SELECT id FROM pkg_group_user WHERE id = ?";
  connection.query(getGroupIdQuery, [Number(id_group)], (err, results) => {
    if (err) {
      console.error("Group ID Error:", err);
      return res.status(500).json({ error: "Erreur de base de données pour l'ID de groupe" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Groupe introuvable" });
    }

    const id_group_int = results[0].id;
    const getPlanIdQuery = "SELECT id FROM pkg_plan WHERE name = ?";

    connection.query(getPlanIdQuery, [id_plan], (err, planResults) => {
      if (err) {
        console.error("Plan ID Error:", err);
        return res.status(500).json({ error: "Erreur de base de données pour le plan" });
      }

      if (planResults.length === 0) {
        return res.status(404).json({ error: "Plan introuvable" });
      }

      const id_plan_int = planResults[0].id;

      const checkUserQuery = "SELECT id FROM pkg_user WHERE username = ?";
      connection.query(checkUserQuery, [username], (err, userResults) => {
        if (err) {
          console.error("User Check Error:", err);
          return res.status(500).json({ error: "Erreur lors de la vérification de l'utilisateur" });
        }

        if (userResults.length > 0) {
          return res.status(400).json({ error: "L'utilisateur existe déjà" });
        }

        generateUniquePin().then(callingcard_pin => {
          const userData = {
            id_user: 1,
            id_group: id_group_int,
            id_group_agent: null,
            id_plan: id_plan_int,
            username: username,
            password: password,
            active: active || 1,
            language: language || 'en',
            callingcard_pin: callingcard_pin
          };

          const insertUserQuery = "INSERT INTO pkg_user SET ?";
          connection.query(insertUserQuery, userData, (err, results) => {
            if (err) {
              console.error("User Insert Error:", err);
              return res.status(500).json({ error: "Erreur lors de l'insertion de l'utilisateur" });
            }

            const userId = results.insertId;

            // Création des SIP users associés
            const sipUsers = [];
            for (let i = 1; i <= numberOfSipUsers; i++) {
              const suffix = String(i).padStart(2, '0');
              sipUsers.push([userId, `${username}-${suffix}`, `${username}-${suffix}`, 'dynamic', 1, 'all']);
            }

            console.log("SIP Users to insert:", sipUsers);

            // Création des IAX users associés
            const iaxUsers = [];
            for (let i = 1; i <= numberOfIax; i++) {
              const suffix = String(i).padStart(2, '0');
              iaxUsers.push([
                userId,
                `${username}-iax${suffix}`,
                `${username}-iax${suffix}`,
                'dynamic', 1 ,
                'all',
                '', // regexten
                callerid || 'default_callerid',
                context || 'default_context',
                fromuser || 'default_fromuser',
                fromdomain || 'default_fromdomain',
                insecure || 'default_insecure',
                mailbox || 'default_mailbox',
                md5secret || 'default_md5secret',
                permit || 'default_permit',
                secret || 'default_secret', // Include secret if needed
                username || 'default_username', // Include username if needed
                disallow || 'default_disallow', // Include disallow if needed
                deny || 'default_deny' // Provide a default value for deny
              ]);
            }

            console.log("IAX Users to insert:", iaxUsers);

            // Insert SIP users
            if (sipUsers.length > 0) {
              const insertSIPQuery = "INSERT INTO pkg_sip (id_user, name, accountcode, host, status, allow) VALUES ?";
              connection.query(insertSIPQuery, [sipUsers], (err) => {
                if (err) {
                  console.error("SIP Insert Error:", err);
                  return res.status(500).json({ error: "Erreur lors de la création des utilisateurs SIP" });
                }

                // Insert IAX users
                if (iaxUsers.length > 0) {
                  const insertIAXQuery = `
                    INSERT INTO pkg_iax (
                      id_user, name, accountcode, host, allow, regexten,
                      callerid, context, fromuser, fromdomain, insecure,
                      mailbox, md5secret, permit, secret, username, disallow, deny
                    ) VALUES ?
                  `;
                  console.log("Executing IAX insert query:", insertIAXQuery, iaxUsers);
                  connection.query(insertIAXQuery, [iaxUsers], (err) => {
                    if (err) {
                      console.error("IAX Insert Error:", err);
                      return res.status(500).json({ error: "Erreur lors de la création des utilisateurs IAX" });
                    }

                    res.status(201).json({ message: "Utilisateur, utilisateurs SIP et IAX ajoutés avec succès" });
                  });
                } else {
                  res.status(201).json({ message: "Utilisateur et utilisateurs SIP ajoutés avec succès" });
                }
              });
            } else {
              // Handle case with no SIP users
              if (iaxUsers.length > 0) {
                const insertIAXQuery = `
                  INSERT INTO pkg_iax (
                    id_user, name, accountcode, host, allow, regexten,
                    callerid, context, fromuser, fromdomain, insecure,
                    mailbox, md5secret, permit, secret, username, disallow, deny
                  ) VALUES ?
                `;
                console.log("Executing IAX insert query:", insertIAXQuery, iaxUsers);
                connection.query(insertIAXQuery, [iaxUsers], (err) => {
                  if (err) {
                    console.error("IAX Insert Error:", err);
                    return res.status(500).json({ error: "Erreur lors de la création des utilisateurs IAX" });
                  }

                  res.status(201).json({ message: "Utilisateur et utilisateurs IAX ajoutés avec succès" });
                });
              } else {
                res.status(201).json({ message: "Utilisateur ajouté sans SIP ni IAX" });
              }
            }
          });
        }).catch(err => {
          console.error("PIN Generation Error:", err);
          return res.status(500).json({ error: "Erreur lors de la génération du code PIN unique" });
        });
      });
    });
  });
};
exports.supprimerUtilisateur = (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM pkg_user WHERE id = ?";

  connection.query(deleteQuery, [Number(id)], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  });
};

exports.modifierUtilisateur = (req, res) => {
  const userId = req.params.id;
  const { username, password, language, active } = req.body;

  const query = "UPDATE pkg_user SET username = ?, password = ?, language = ?, active = ? WHERE id = ?";

  connection.query(query, [username, password, language, active, userId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Erreur de base de données" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur modifié avec succès" });
  });
};
