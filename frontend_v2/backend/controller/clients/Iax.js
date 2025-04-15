const connection = require("../../config/dataBase");

// Afficher les informations de pkg_iax
const getAgent = (agentId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM pkg_user WHERE id = ?`; 
        connection.query(query, [agentId], (err, result) => {
            if (err) {
                console.error("Error fetching agent data:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

exports.afficherIax = async (req, res) => {
    try {
        const query = `
            SELECT 
            i.id,
                i.name,
                u.username AS user_name, 
                i.secret, 
                i.host, 
                i.port,
                i.context,
                i.callerid,
                i.allow,
                i.nat,
                i.qualify,
                i.dtmfmode,
                i.insecure,
                i.type
            FROM 
                pkg_iax i
            INNER JOIN 
                pkg_user u 
            ON 
                i.id_user = u.id
            ORDER BY 
                i.id_user DESC;
        `;

        connection.query(query, (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des informations de pkg_iax:", err);
                return res.status(500).json({ error: "Erreur de base de données" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Aucune donnée trouvée" });
            }

            res.json({ iax: results });
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        res.status(500).send("Erreur interne du serveur");
    }
};

// Ajouter un enregistrement dans pkg_iax
exports.ajouterIax = (req, res) => {
    // Check if connection is available
    if (!connection) {
      console.error("Database connection not established");
      return res.status(500).json({ error: "Database connection error" });
    }
  
    const {
      id_user,
      user_name,
      secret,
      host,
      port,
      context,
      callerid,
      allow,
      disallow,
      nat,
      qualify,
      dtmfmode,
      insecure,
      type,
      permit,
      deny
    } = req.body;
  
    console.log("Incoming request body:", req.body); // Log the incoming data
  
    // Validate required fields
    if (!user_name || !secret) {
      return res.status(400).json({ error: "user_name and secret are required." });
    }
  
    const query = `
      INSERT INTO pkg_iax (
        id_user, name, username, accountcode, regexten,
        fromuser, fromdomain, mailbox, md5secret,
        secret, host, port, context, callerid,
        allow, disallow, nat, qualify, dtmfmode, insecure,
        type, permit, deny
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    // Set default values for optional parameters
    const params = [
      id_user || 0,
      user_name,
      user_name,
      user_name,
      user_name,
      "default_fromuser",
      "default_fromdomain",
      "default_mailbox",
      "default_md5secret",
      secret,
      host || "dynamic",
      port || "4569",
      context || "default",
      callerid || "",
      allow || "",
      disallow || "all",
      nat || "yes",
      qualify || "yes",
      dtmfmode || "rfc2833",
      insecure || "port,invite",
      type || "friend",
      permit || "0.0.0.0/0.0.0.0",
      deny || "0.0.0.0/0.0.0.0"
    ];
  
    // Add timeout to prevent hanging requests
    const queryTimeout = setTimeout(() => {
      return res.status(504).json({ error: "Database query timeout" });
    }, 30000); // 30 seconds timeout
  
    connection.query(query, params, (error, results) => {
      // Clear the timeout since we got a response
      clearTimeout(queryTimeout);
  
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ 
          error: "Database error", 
          details: error.sqlMessage || error.message 
        });
      }
      
      res.status(201).json({ 
        message: "IAX entry added successfully",
        id: results.insertId
      });
    });
  };
// Fetch users for the dropdown
exports.UsersIax = async (req, res) => {
    try {
        const query = `SELECT * FROM pkg_user`; 
        connection.query(query, async (err, users) => {
            if (err) {
                return res.json(err);
            }

            const usersWithAgentData = await Promise.all(users.map(async (user) => {
                const agentData = await getAgent(user.id);
                return {
                    ...user,
                    agent: agentData[0]
                };
            }));

            res.json({ users: usersWithAgentData });
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.json(err);
    }
};
// Update an entry in pkg_iax
exports.modifierIax = (req, res) => {
    const iaxId = req.params.id;

    if (!iaxId) {
        return res.status(400).json({ error: "ID est requis" });
    }

    const {
        id_user,
        user_name,
        secret,
        host,
        port,
        context,
        callerid,
        allow,
        disallow,
        nat,
        qualify,
        dtmfmode,
        insecure,
        type,
        permit,
        deny
    } = req.body;

    const query = `
        UPDATE pkg_iax SET
            id_user = ?, name = ?, username = ?, secret = ?, host = ?, port = ?,
            context = ?, callerid = ?, allow = ?, disallow = ?, nat = ?,
            qualify = ?, dtmfmode = ?, insecure = ?, type = ?, permit = ?, deny = ?
        WHERE id = ?
    `;

    const params = [
        id_user || 0,
        user_name,
        user_name,
        secret,
        host || "dynamic",
        port || "4569",
        context || "default",
        callerid || "",
        allow || "",
        disallow || "all",
        nat || "yes",
        qualify || "yes",
        dtmfmode || "rfc2833",
        insecure || "port,invite",
        type || "friend",
        permit || "0.0.0.0/0.0.0.0",
        deny || "0.0.0.0/0.0.0.0",
        iaxId
    ];

    connection.query(query, params, (err, result) => {
        if (err) {
            console.error("Erreur lors de la modification de l'enregistrement:", err.message);
            return res.status(500).json({ error: "Erreur de base de données", details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }

        res.status(200).json({ message: "Enregistrement modifié avec succès" });
    });
};
// Supprimer un enregistrement de pkg_iax
exports.supprimerIax = (req, res) => {
    const iaxId = req.params.id;

    if (!iaxId) {
        return res.status(400).json({ error: "ID est requis" });
    }

    const query = "DELETE FROM pkg_iax WHERE id = ?";

    connection.query(query, [iaxId], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de l'enregistrement:", err);
            return res.status(500).json({ error: "Erreur de base de données" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }

        res.status(200).json({ message: "Enregistrement supprimé avec succès" });
    });
};