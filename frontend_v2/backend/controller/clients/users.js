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
    LEFT JOIN pkg_user cu ON u.id_user = cu.id  -- Join to get the creator's username
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
  



}

const generateUniquePin = () => {
    return new Promise((resolve, reject) => {
        let pin;
        const checkPinQuery = "SELECT COUNT(*) AS count FROM pkg_user WHERE callingcard_pin = ?";

        // Generate a random 6-digit pin
        const generatePin = () => {
            pin = Math.floor(100000 + Math.random() * 900000);  // Random 6-digit number
            connection.query(checkPinQuery, [pin], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results[0].count > 0) {
                    // If pin exists, generate a new one
                    generatePin();
                } else {
                    // Pin is unique, resolve the promise
                    resolve(pin);
                }
            });
        };

        generatePin();
    });
};

exports.ajouterUtilisateur = (req, res) => {
    const { username, password, id_group, id_plan, language, active } = req.body;

    console.log("Received Request Body:", req.body);

    // Fetch the correct id_group from pkg_group_user
    const getGroupIdQuery = "SELECT id FROM pkg_group_user WHERE id = ?";

    connection.query(getGroupIdQuery, [Number(id_group)], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du groupe :", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Groupe introuvable" });
        }

        const id_group_int = results[0].id; // Ensure it's an integer

        // Fetch the correct id_plan from pkg_plan
        const getPlanIdQuery = "SELECT id FROM pkg_plan WHERE name = ?";

        connection.query(getPlanIdQuery, [id_plan], (err, planResults) => {
            if (err) {
                console.error("Erreur lors de la récupération du plan :", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (planResults.length === 0) {
                return res.status(400).json({ error: "Plan introuvable" });
            }

            const id_plan_int = planResults[0].id; // Ensure it's an integer

            // Generate a unique callingcard_pin
            generateUniquePin().then(callingcard_pin => {
                // Create userData object with all necessary fields
                const userData = {
                    id_user: 1,  // Let the database auto-generate this ID
                    id_group: id_group_int,
                    id_group_agent: null, // Assuming this can be null if not provided
                    id_plan: id_plan_int,
                    id_offer: null, // Assuming this can be null if not provided
                    username: username,
                    password: password,
                    credit: 0,
                    active: active || 1,
                    creationdate: new Date(),
                    firstusedate: null, // Assuming null if not used
                    expirationdate: null, // Assuming null if not set
                    enableexpire: 0,
                    expiredays: null,
                    lastname: '',
                    firstname: '',
                    address: '',
                    city: '',
                    neighborhood: '',
                    state: '',
                    country: '',
                    zipcode: '',
                    phone: '',
                    mobile: '',
                    email: '',
                    email2: '',
                    vat: '',
                    company_name: '',
                    commercial_name: '',
                    company_website: '',
                    state_number: '',
                    dist: '',
                    contract_value: 0,
                    lastuse: '0000-00-00 00:00:00',
                    typepaid: 0,
                    creditlimit: 0,
                    language: language || 'en',
                    redial: 0,
                    loginkey: '',
                    last_notification: '0000-00-00 00:00:00',
                    credit_notification: 0,
                    credit_notification_daily: 0,
                    restriction: 0,
                    callingcard_pin: callingcard_pin,
                    prefix_local: '',
                    callshop: 0,
                    plan_day: 0,
                    record_call: 0,
                    active_paypal: 0,
                    boleto: 0,
                    boleto_day: 0,
                    description: '',
                    last_login: '0000-00-00 00:00:00',
                    googleAuthenticator_enable: 0,
                    google_authenticator_key: '',
                    doc: '',
                    id_sacado_sac: 0,
                    disk_space: -1,
                    sipaccountlimit: -1,
                    calllimit: -1,
                    cpslimit: -1,
                    calllimit_error: '503',
                    mix_monitor_format: 'gsm',
                    transfer_show_selling_price: 0,
                    transfer_bdservice_rate: 0,
                    transfer_dbbl_rocket_profit: 0,
                    transfer_bkash_profit: 0,
                    transfer_flexiload_profit: 0,
                    transfer_international_profit: 0,
                    transfer_dbbl_rocket: 0,
                    transfer_bkash: 0,
                    transfer_flexiload: 0,
                    transfer_international: 0,
                    restriction_use: 1,
                    email_services: 1,
                    email_did: 1,
                    inbound_call_limit: -1
                };

                // Log columns and values for debugging
                const columns = [
                    'id_user', 'id_group', 'id_group_agent', 'id_plan', 'id_offer', 'username', 'password', 'credit', 'active', 'creationdate', 'firstusedate', 'expirationdate',
                    'enableexpire', 'expiredays', 'lastname', 'firstname', 'address', 'city', 'neighborhood', 'state', 'country', 'zipcode', 'phone', 'mobile', 'email', 'email2', 'vat',
                    'company_name', 'commercial_name', 'company_website', 'state_number', 'dist', 'contract_value', 'lastuse', 'typepaid', 'creditlimit', 'language', 'redial',
                    'loginkey', 'last_notification', 'credit_notification', 'credit_notification_daily', 'restriction', 'callingcard_pin', 'prefix_local', 'callshop', 'plan_day',
                    'record_call', 'active_paypal', 'boleto', 'boleto_day', 'description', 'last_login', 'googleAuthenticator_enable', 'google_authenticator_key', 'doc', 'id_sacado_sac',
                    'disk_space', 'sipaccountlimit', 'calllimit', 'cpslimit', 'calllimit_error', 'mix_monitor_format', 'transfer_show_selling_price', 'transfer_bdservice_rate',
                    'transfer_dbbl_rocket_profit', 'transfer_bkash_profit', 'transfer_flexiload_profit', 'transfer_international_profit', 'transfer_dbbl_rocket', 'transfer_bkash',
                    'transfer_flexiload', 'transfer_international', 'restriction_use', 'email_services', 'email_did', 'inbound_call_limit'
                ];

                const values = Object.values(userData);

                console.log("Columns:", columns);
                console.log("Values:", values);
                console.log("Columns length:", columns.length);
                console.log("Values length:", values.length);

                // Insert query - Ensure column names match the values
                const insertQuery = `
                    INSERT INTO pkg_user (
                        ${columns.join(', ')}
                    ) 
                    VALUES (${columns.map(() => '?').join(', ')})
                `;

                connection.query(insertQuery, values, (err, results) => {
                    if (err) {
                        console.error("Erreur lors de l'ajout de l'utilisateur :", err);
                        return res.status(500).json(err);
                    }

                    res.status(201).json({ message: "Utilisateur ajouté avec succès", userId: results.insertId });
                });
            }).catch(err => {
                console.error("Erreur lors de la génération du pin unique :", err);
                return res.status(500).json({ error: "Error generating unique pin" });
            });
        });
    });
};
