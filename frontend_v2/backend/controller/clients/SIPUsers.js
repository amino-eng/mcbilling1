const connection = require("../../config/dataBase");

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
};

// Fetch SIP Users with all columns
exports.afficherSIPUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM pkg_sip ORDER BY id DESC`;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.json({ sipUsers: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};


// Add SIP User
exports.ajouterSIPUser = (req, res) => {
  let { id_user, name, accountcode, host, status = '1' } = req.body;
  console.log(req.body);
status=1
  // // Validate required fields
  // if (!id_user || !name || !accountcode || !host || (status === undefined)) {
  //   return res.status(400).json({ error: "id_user, name, accountcode, host and status are required." });
  // }

  const query = `
    INSERT INTO pkg_sip (id_user, name, accountcode, host, status) 
    VALUES (?, ?, ?, ?, ?)
  `;

  console.log("Incoming data:", { id_user, name, accountcode, host, status });

  // Convert status to an integer
  const statusValue = parseInt(status, 10);
  if (isNaN(statusValue)) {
    return res.status(400).json({ error: "Status must be a valid number." });
  }

  // Execute the query
  connection.query(query, [id_user, name, accountcode, host, statusValue], (error, results) => {
    if (error) {
      console.error("Database error while adding SIP user:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }
    res.status(201).json({ message: "Record added successfully" });
  });
};

// Fetch SIP Users with all columns
exports.afficherSIPUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM pkg_sip ORDER BY id DESC`;
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.json({ sipUsers: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Get all SIP Users with agent data
exports.sipUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM pkg_sip`; 
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

      res.json({
        users: usersWithAgentData
      });
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.json(err);
  }
};

// Get Trunk Groups
exports.trunkGroups = async (req, res) => {
  try {
    const query = `SELECT * FROM pkg_trunk_group`; 
    connection.query(query, async (err, trunkGroups) => {
      if (err) {
        return res.json(err);
      }

      const trunkGroupsWithDetails = await Promise.all(trunkGroups.map(async (trunk) => {
        const userData = await getAgent(trunk.id_user);
        return {
          ...trunk,
          username: userData?.username || null,
          description: trunk.description
        };
      }));

      res.json({
        trunkGroups: trunkGroupsWithDetails
      });
    });
  } catch (err) {
    console.error("Error fetching trunk group data:", err);
    res.json(err);
  }
};

// Update SIP User (complete version)
exports.modifierSIPUser = (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur à modifier
  const {
    id_user, name, accountcode, host, status, allow,
    sippasswd, callerid, alias, codecs, sip_group,
    block_call_reg, record_call, techprefix, nat, directmedia,
    qualify, context, dtmfmode, insecure, deny, permit,
    type, allowtransfer, fakeRing, callLimit, moh,
    addparameter, forwardType, dial_timeout, enableVoicemail,
    email, voicemail_email, voicemail_password
  } = req.body; // Récupérer les données du corps de la requête

  // Vérifier si l'ID est présent
  if (!id) {
    return res.status(400).json({ error: "ID est requis" });
  }

  // Requête SQL pour mettre à jour l'utilisateur SIP
  const query = `
    UPDATE pkg_sip 
    SET 
      id_user = ?, name = ?, accountcode = ?, host = ?, 
      status = ?, allow = ?, secret = ?, callerid = ?, 
      alias = ?, codecs = ?, sip_group = ?,
      block_call_reg = ?, record_call = ?, techprefix = ?,
      nat = ?, directmedia = ?, qualify = ?, context = ?,
      dtmfmode = ?, insecure = ?, deny = ?, permit = ?,
      type = ?, allowtransfer = ?, fakeRing = ?, callLimit = ?,
      moh = ?, addparameter = ?, forwardType = ?, dial_timeout = ?,
      enableVoicemail = ?, email = ?, voicemail_email = ?, voicemail_password = ?
    WHERE id = ?
  `;

  // Paramètres de la requête
  const params = [
    id_user, name, accountcode, host, status, allow,
    sippasswd, callerid, alias, codecs.join(","), sip_group,
    block_call_reg, record_call, techprefix, nat, directmedia,
    qualify, context, dtmfmode, insecure, deny, permit,
    type, allowtransfer, fakeRing, callLimit, moh,
    addparameter, forwardType, dial_timeout, enableVoicemail,
    email, voicemail_email, voicemail_password,
    id // ID de l'utilisateur à mettre à jour
  ];

  // Exécution de la requête
  connection.query(query, params, (error, result) => {
    if (error) {
      // Log de l'erreur si la requête échoue
      console.error("Full database error:", error);
      return res.status(500).json({ 
        error: "Erreur base de données",
        details: {
          code: error.code,
          message: error.sqlMessage,
          sql: error.sql
        }
      });
    }

    // Vérifier si l'utilisateur a été trouvé et mis à jour
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Réponse de succès
    res.status(200).json({ message: "Utilisateur SIP modifié avec succès" });
  });
};

// Delete SIP User
exports.supprimerSIPUser = (req, res) => {
  const sipId = req.params.id;

  if (!sipId) {
    return res.status(400).json({ error: "ID is required" });
  }

  const query = "DELETE FROM pkg_sip WHERE id = ?";

  connection.query(query, [sipId], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  });
};