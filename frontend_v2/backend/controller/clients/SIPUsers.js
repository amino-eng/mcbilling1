const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const connection = require('../../config/dataBase');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for logging errors
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'sip_errors.log'),
  { flags: 'a' }
);

// Helper function to log errors to file
function logErrorToFile(error, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    },
    context
  };
  
  errorLogStream.write(JSON.stringify(logEntry, null, 2) + '\n\n');
}

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

exports.getUsers = (req, res) => {
  const query = `
    SELECT u.id as id_user, u.username 
    FROM pkg_user u 
    ORDER BY u.username ASC
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ users: results });
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

// Get detailed SIP user data by ID
exports.getSIPUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `SELECT * FROM pkg_sip WHERE id = ?`;
    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "SIP user not found" });
      }

      res.json({ sipUser: result[0] });
    });
  } catch (error) {
    console.error("Error fetching SIP user details:", error);
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
  console.log('Received update request for SIP user:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { id } = req.params;
  const {
    id_user, name, accountcode, host, status, allow,
    sippasswd, callerid, alias, codecs, sip_group,
    block_call_reg, record_call, techprefix, nat, directmedia,
    qualify, context, dtmfmode, insecure, deny, permit,
    type, allowtransfer, fakeRing, callLimit, moh,
    addparameter, forwardType, dial_timeout, enableVoicemail,
    email, voicemail_email, voicemail_password
  } = req.body;

  // Vérifier si l'ID est présent
  if (!id) {
    return res.status(400).json({ error: "ID est requis" });
  }

  // Map codecs array to a comma-separated string for the 'allow' field
  const allowValue = Array.isArray(codecs) ? codecs.join(',') : '';
  
  // Convert string 'yes'/'no' to 1/0 for boolean fields
  const recordCallInt = record_call === 'yes' ? 1 : 0;
  const blockCallRegInt = block_call_reg === 'yes' ? 1 : 0;
  const allowtransferInt = allowtransfer === 'yes' ? 1 : 0;
  const directMediaInt = directmedia === 'yes' ? 1 : 0;
  const qualifyInt = qualify === 'yes' ? 1 : 0;

  // Requête SQL pour mettre à jour l'utilisateur SIP avec uniquement les colonnes existantes
  const query = `
    UPDATE pkg_sip 
    SET 
      id_user = ?, name = ?, accountcode = ?, host = ?, 
      status = ?, allow = ?, sippasswd = ?, callerid = ?, 
      alias = ?, sip_group = ?,
      block_call_reg = ?, record_call = ?, techprefix = ?,
      nat = ?, directmedia = ?, qualify = ?, context = ?,
      dtmfmode = ?, insecure = ?, deny = ?, permit = ?,
      type = ?, allowtransfer = ?, calllimit = ?,
      addparameter = ?, dial_timeout = ?
    WHERE id = ?
  `;

  // Paramètres de la requête (seulement ceux qui correspondent aux colonnes existantes)
  const params = [
    id_user, name, accountcode, host, 
    status, allowValue, sippasswd, callerid, 
    alias, sip_group,
    blockCallRegInt, recordCallInt, techprefix, 
    nat, directMediaInt, qualifyInt, context, 
    dtmfmode, insecure, deny, permit,
    type, allowtransferInt, callLimit,
    addparameter, dial_timeout,
    id // ID de l'utilisateur à mettre à jour
  ];

  // Execute the query with better error handling
  connection.query(query, params, (error, result) => {
    if (error) {
      // Log the error to file
      logErrorToFile(error, {
        query,
        params,
        requestBody: req.body,
        sipUserId: id
      });
      
      // Also log to console
      console.error('=== DATABASE ERROR ===');
      console.error('Error details logged to sip_errors.log');
      console.error('Error code:', error.code);
      console.error('Error message:', error.sqlMessage);
      
      // Send detailed error to client
      return res.status(500).json({ 
        error: "Database operation failed",
        details: {
          code: error.code || 'UNKNOWN_ERROR',
          message: 'Check server logs for details. Log file: backend/logs/sip_errors.log',
          sqlState: error.sqlState || 'UNKNOWN_STATE',
          hint: 'The error has been logged. Please check the server logs for more details.'
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