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

// Afficher tous les utilisateurs avec leurs informations associées
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

// Générer un PIN unique
const generateUniquePin = () => {
  return new Promise((resolve, reject) => {
    const checkPinQuery = "SELECT COUNT(*) AS count FROM pkg_user WHERE callingcard_pin = ?";

    const generatePin = () => {
      const pin = Math.floor(100000 + Math.random() * 900000);
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

// Ajouter un utilisateur
exports.ajouterUtilisateur = (req, res) => {
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
    deny
  } = req.body;

  const getGroupIdQuery = "SELECT id FROM pkg_group_user WHERE id = ?";
  connection.query(getGroupIdQuery, [Number(id_group)], (err, results) => {
    if (err) {
      console.error("Group ID Error:", err);
      return res.status(500).json({ error: "Database error for group ID" });
    }

    if (results.length === 0) {
      console.log('group not found');
      
      return res.status(404).json({ error: "Group not found" });
    }

    const id_group_int = results[0].id;
    const getPlanIdQuery = "SELECT id FROM pkg_plan WHERE name = ?";

    connection.query(getPlanIdQuery, [id_plan], (err, planResults) => {
      if (err) {
        console.error("Plan ID Error:", err);
        return res.status(500).json({ error: "Database error for plan" });
      }

      if (planResults.length === 0) {
        console.log('plan not found');
        return res.status(500).json({ error: "Plan not found" });
      }

      const id_plan_int = planResults[0].id;

      const checkUserQuery = "SELECT id FROM pkg_user WHERE username = ?";
      connection.query(checkUserQuery, [username], (err, userResults) => {
        if (err) {
          console.error("User Check Error:", err);
          return res.status(500).json({ error: "Error checking user" });
        }

        if (userResults.length > 0) {
          console.log('user already exists');
          return res.status(400).json({ error: "User already exists" });
        }

        generateUniquePin().then(callingcard_pin => {
          const userData = {
            id_user: 1,
            id_group: id_group_int,
            id_group_agent: null,
            id_plan: id_plan_int,
            username,
            password,
            active: active || 1,
            language: language || 'en',
            callingcard_pin
          };

          const insertUserQuery = "INSERT INTO pkg_user SET ?";
          connection.query(insertUserQuery, userData, (err, results) => {
            if (err) {
              console.error("User Insert Error:", err);
              return res.status(500).json({ error: "Error inserting user" });
            }

            const userId = results.insertId;

            // Création des SIP users associés
            const sipUsers = Array.from({ length: numberOfSipUsers }, (_, i) => [
              userId,
              `${username}-${String(i + 1).padStart(2, '0')}`,
              `${username}-${String(i + 1).padStart(2, '0')}`,
              'dynamic',
              1,
              'all'
            ]);

            console.log("SIP Users to insert:", sipUsers);

            // Création des IAX users associés
            const iaxUsers = Array.from({ length: numberOfIax }, (_, i) => [
              userId,
              `${username}-iax${String(i + 1).padStart(2, '0')}`,
              `${username}-iax${String(i + 1).padStart(2, '0')}`,
              'dynamic',
              'all',
              '',
              callerid || 'default_callerid',
              context || 'default_context',
              fromuser || 'default_fromuser',
              fromdomain || 'default_fromdomain',
              insecure || 'default_insecure',
              mailbox || 'default_mailbox',
              md5secret || 'default_md5secret',
              permit || 'default_permit',
              secret || 'default_secret',
              username || 'default_username',
              disallow || 'default_disallow',
              deny || 'default_deny'
            ]);

            console.log("IAX Users to insert:", iaxUsers);

            // Insert SIP users
            if (sipUsers.length > 0) {
              const insertSIPQuery = "INSERT INTO pkg_sip (id_user, name, accountcode, host, status, allow) VALUES ?";
              connection.query(insertSIPQuery, [sipUsers], (err) => {
                if (err) {
                  console.error("SIP Insert Error:", err);
                  return res.status(500).json({ error: "Error creating SIP users" });
                }

                // Insert IAX users if any
                if (iaxUsers.length > 0) {
                  const insertIAXQuery = `
                    INSERT INTO pkg_iax (
                      id_user, name, accountcode, host, allow, regexten,
                      callerid, context, fromuser, fromdomain, insecure,
                      mailbox, md5secret, permit, secret, username, disallow, deny
                    ) VALUES ?
                  `;
                  connection.query(insertIAXQuery, [iaxUsers], (err) => {
                    if (err) {
                      console.error("IAX Insert Error:", err);
                      return res.status(500).json({ error: "Error creating IAX users" });
                    }

                    res.status(201).json({ message: "User, SIP, and IAX users added successfully" });
                  });
                } else {
                  res.status(201).json({ message: "User and SIP users added successfully" });
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
                connection.query(insertIAXQuery, [iaxUsers], (err) => {
                  if (err) {
                    console.error("IAX Insert Error:", err);
                    return res.status(500).json({ error: "Error creating IAX users" });
                  }

                  res.status(201).json({ message: "User and IAX users added successfully" });
                });
              } else {
                res.status(201).json({ message: "User added without SIP or IAX" });
              }
            }
          });
        }).catch(err => {
          console.error("PIN Generation Error:", err);
          return res.status(500).json({ error: "Error generating unique PIN" });
        });
      });
    });
  });
};

// Supprimer un utilisateur
exports.supprimerUtilisateur = (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM pkg_user WHERE id = ?";

  connection.query(deleteQuery, [Number(id)], (err) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting user" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  });
};

// Modifier un utilisateur
exports.modifierUtilisateur = (req, res) => {
  const userId = req.params.id;
  const {
    username,
    password,
    id_group,
    id_plan,
    language,
    active,
  } = req.body;
console.log(req.body);

  const query = `
    UPDATE pkg_user 
    SET 
      username = ?, 
      password = ?, 
      id_group = ?, 
      id_plan = ?, 
      language = ?, 
      active = ?
    WHERE id = ?`; // Removed the comma before WHERE

  connection.query(query, [
    username,
    password,
    id_group,
    id_plan,
    language,
    active,
    userId
  ], (error, results) => {
    if (error || results.affectedRows === 0) {
      console.error("Database Update Error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "User updated successfully" });
  });
};