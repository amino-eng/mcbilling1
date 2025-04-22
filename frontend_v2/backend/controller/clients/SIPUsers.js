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
  const { id_user, name, accountcode, host, status, allow } = req.body;

  const query = `
    INSERT INTO pkg_sip (id_user, name, accountcode, host, status, allow) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [id_user, name, accountcode, host, status, allow], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Record added successfully" });
  });
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
  const { id } = req.params;
  const {
    id_user, name, accountcode, host, status, allow,
    sippasswd, callerid, alias, disable, codecs, sip_group,
    block_call_reg, record_call, techprefix, nat, directmedia,
    qualify, context, dtmfmode, insecure, deny, permit,
    type, allowtransfer, fakeRing, callLimit, moh,
    addparameter, forwardType, dial_timeout, enableVoicemail,
    email, password, voicemail_email, voicemail_password
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = `
    UPDATE pkg_sip 
    SET 
      id_user = ?, name = ?, accountcode = ?, host = ?, 
      status = ?, allow = ?, secret = ?, callerid = ?, 
      alias = ?, disable = ?, codecs = ?, sip_group = ?,
      block_call_reg = ?, record_call = ?, techprefix = ?,
      nat = ?, directmedia = ?, qualify = ?, context = ?,
      dtmfmode = ?, insecure = ?, deny = ?, permit = ?,
      type = ?, allowtransfer = ?, fakeRing = ?, callLimit = ?,
      moh = ?, addparameter = ?, forwardType = ?, dial_timeout = ?,
      enableVoicemail = ?, email = ?, voicemail_email = ?, voicemail_password = ?
    WHERE id = ?
  `;

  const params = [
    id_user, name, accountcode, host, status, allow,
    sippasswd, callerid, alias, disable, codecs.join(","), sip_group,
    block_call_reg, record_call, techprefix, nat, directmedia,
    qualify, context, dtmfmode, insecure, deny, permit,
    type, allowtransfer, fakeRing, callLimit, moh,
    addparameter, forwardType, dial_timeout, enableVoicemail,
    email, voicemail_email, voicemail_password,
    id
  ];

  connection.query(query, params, (error, result) => {
    if (error) {
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

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