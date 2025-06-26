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

// Get all prefixes from pkg_prefix table
exports.getPrefixes = (req, res) => {
  const query = 'SELECT id, prefix FROM pkg_prefix ORDER BY prefix ASC';
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching prefixes:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ prefixes: results });
  });
};

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


// Fonction pour générer un mot de passe numérique aléatoire (retourne un nombre)
const generateNumericPassword = (length = 6) => {
  const numbers = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  // Convertir en nombre entier
  return parseInt(result, 10);
};

// Add SIP User
exports.ajouterSIPUser = (req, res) => {
  const {
    id_user, name, accountcode, host, status = '1', callerid, 
    alias, codecs = 'g729,ulaw,opus,gsm,alaw', sip_group, record_call = 'no', techprefix = '0',
    nat = 'force_rport,comedia', directmedia = 'no', qualify = 'yes', context = 'billing', 
    dtmfmode = 'RFC2833', insecure = 'no', deny = '', permit = '',
    type = 'friend', allowtransfer = 'no', fakeRing = 'no', callLimit = 0, moh = '', 
    addparameter = '', forwardType = 'undefined', dial_timeout = 60, enableVoicemail = 'no', 
    email = '', voicemail_email = '', voicemail_password = generateNumericPassword(), disallow = 'all'
  } = req.body;
  
  console.log("Received request to add SIP user:", req.body);

  // First, get the user's password
  const getUserQuery = "SELECT password FROM pkg_user WHERE id = ?";
  
  connection.query(getUserQuery, [id_user], (err, userResults) => {
    if (err) {
      console.error("Error fetching user password:", err);
      return res.status(500).json({ error: "Database error while fetching user data" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPassword = userResults[0].password;

    // Check if SIP user with the same name already exists
    const checkQuery = "SELECT id FROM pkg_sip WHERE name = ?";
    
    connection.query(checkQuery, [name], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for existing SIP user:", checkErr);
        return res.status(500).json({ error: "Error checking for existing SIP user" });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({ 
          error: "SIP user with this name already exists",
          details: `A SIP user with the name '${name}' already exists. Please choose a different name.`
        });
      }
      
      // Handle techprefix - convert to integer, use NULL for empty, '0', or 0
      const safeTechPrefix = techprefix && techprefix !== '0' && techprefix !== 0 ? parseInt(techprefix, 10) : null;
    
      // Convertir les champs booléens
      const recordCallValue = record_call === 'yes' ? 1 : 0;
      // allowtransfer: stocker 'no' ou 'yes' directement
      const allowtransferValue = allowtransfer === 'yes' ? 'yes' : 'no';
      // directmedia: stocker 'no' ou 'yes' directement
      const directMediaValue = directmedia === 'yes' ? 'yes' : 'no';
      // Set qualify from input with default to 'yes'
      const qualifyValue = qualify === 'no' ? 'no' : 'yes';
      const enableVoicemailValue = enableVoicemail === 'yes' ? 1 : 0;

      // Helper function to replace null/undefined/empty with empty string
      const safeValue = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.trim() === '') return '';
        if (val === 'vide') return '';  // Remove 'vide' text
        return val;
      };
      
      // Function to generate a random numeric password
      const generateNumericPassword = (length = 6) => {
        const numbers = '0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return parseInt(result, 10);
      };
      
      // Nettoyer le nom en supprimant le suffixe -01 s'il existe
      const cleanName = name ? (name.endsWith('-01') ? name.slice(0, -3) : name) : '';
      // Utiliser le nom nettoyé comme accountcode sans ajouter -01
      const accountCodeValue = safeValue(accountcode) || cleanName;
      
      // S'assurer que le voicemail_password est un nombre valide
      const safeVoicemailPassword = voicemail_password && !isNaN(voicemail_password) 
        ? parseInt(voicemail_password, 10) 
        : generateNumericPassword();
      
      // Define all fields in the exact order they appear in the database table
      const fields = [
        'id_user', 'name', 'accountcode', 'host', 'status', 'secret', 'callerid',
        'alias', 'disallow', 'allow', 'sip_group', 'record_call',
        'techprefix', 'nat', 'directmedia', 'qualify', 'context', 'dtmfmode', 'insecure', 'deny', 'permit',
        'type', 'allowtransfer', 'calllimit', 'addparameter', 'dial_timeout',
        'voicemail_email', 'voicemail_password', 'id_trunk_group', 'defaultuser',
        // Additional fields to prevent NULL values
        'regexten', 'callgroup', 'defaultip', 'fromuser', 'fromdomain', 'language',
        'mailbox', 'md5secret', 'pickupgroup', 'ipaddr', 'fullcontact', 'setvar',
        'regserver', 'lastms', 'auth', 'subscribemwi', 'vmexten', 'cid_number',
        'callingpres', 'usereqphone', 'mohsuggest', 'autoframing', 'outboundproxy',
        'useragent', 'url_events', 'sip_config', 'description', 'amaflags'
      ];
      
      // Préparer les valeurs avec des valeurs par défaut appropriées
      const params = [
        safeValue(id_user), 
        safeValue(cleanName),
        safeValue(accountCodeValue),
        safeValue(host),
        safeValue(status),
        safeValue(userPassword),
        safeValue(callerid),
        safeValue(alias),
        safeValue(disallow),
        safeValue(codecs),
        safeValue(sip_group),
        recordCallValue,
        safeTechPrefix,
        safeValue(nat),
        directMediaValue,
        qualifyValue,
        safeValue(context),
        safeValue(dtmfmode),
        safeValue(insecure),
        safeValue(deny),
        safeValue(permit),
        safeValue(type),
        allowtransferValue,
        callLimit || 0,
        safeValue(addparameter),
        dial_timeout || 60,
        safeValue(voicemail_email),
        safeVoicemailPassword,
        0,  // id_trunk_group
        safeValue(cleanName, 'user' + Date.now()),  // defaultuser
        // Additional fields with default values
        "",    // amaflags
        '',  // regexten
        '',  // callgroup
        '',  // defaultip
        '',  // fromuser
        '',  // fromdomain
        '',  // language
        '',  // mailbox
        '',  // md5secret
        '',  // pickupgroup
        '',  // ipaddr
        '',  // fullcontact
        '',  // setvar
        '',  // regserver
        '',  // lastms
        '',  // auth
        '',  // subscribemwi
        '',  // vmexten
        '',  // cid_number
        '',  // callingpres
        '',  // usereqphone
        '',  // mohsuggest
        '',  // autoframing
        '',  // outboundproxy
        '',  // useragent
        '',  // url_events
        '',  // sip_config
        ''   // description
      ];
      
      console.log('Using voicemail_password:', safeVoicemailPassword, typeof safeVoicemailPassword);

      const query = `
        INSERT INTO pkg_sip (
          ${fields.join(', ')}
        ) VALUES (${Array(fields.length).fill('?').join(', ')})
      `;

      console.log("Creating SIP user with data:", { params });

      // Convert status to an integer
      const statusValue = parseInt(status, 10);
      if (isNaN(statusValue)) {
        return res.status(400).json({ error: "Status must be a valid number." });
      }

      // Execute the query with all fields
      connection.query(query, params, (error, results) => {
        if (error) {
          console.error("Database error while adding SIP user:", error);
          return res.status(500).json({ 
            error: "Database error", 
            details: error.message,
            sql: error.sql,
            code: error.code
          });
        }
        return res.status(201).json({ 
          message: "SIP user added successfully",
          id: results.insertId 
        });
      });
    }); // Close the check query
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
    
    // First get the SIP user details
    const sipQuery = `SELECT * FROM pkg_sip WHERE id = ?`;
    connection.query(sipQuery, [id], async (err, sipResult) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (sipResult.length === 0) {
        return res.status(404).json({ message: "SIP user not found" });
      }

      const sipUser = sipResult[0];
      
      // Get the user's password from pkg_user table
      const userQuery = `SELECT password FROM pkg_user WHERE id = ? ORDER BY password ASC`;
      connection.query(userQuery, [sipUser.id_user], (userErr, userResults) => {
        if (userErr) {
          console.error("Error fetching user password:", userErr);
          // Continue even if we can't get the password
          return res.json({ sipUser });
        }

        // Add the password to the SIP user object
        if (userResults.length > 0) {
          sipUser.secret = userResults[0].password;
        }
        
        // Ensure callerid and techprefix are always strings, not NULL
        if (sipUser.callerid === null) sipUser.callerid = '';
        if (sipUser.techprefix === null) sipUser.techprefix = '';
        
        console.log('SIP User details with secret:', JSON.stringify(sipUser, null, 2));
        res.json({ sipUser });
      });
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

  // First, check if a SIP user with the same name already exists (excluding the current user)
  const checkDuplicateQuery = 'SELECT id FROM pkg_sip WHERE name = ? AND id != ?';
  
  connection.query(checkDuplicateQuery, [name, id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking for duplicate SIP user:', checkErr);
      return res.status(500).json({ 
        error: 'Database error while checking for duplicate SIP user',
        details: checkErr.message 
      });
    }
    
    if (checkResults.length > 0) {
      return res.status(409).json({ 
        error: 'SIP user with this name already exists',
        details: `A SIP user with the name '${name}' already exists. Please choose a different name.`
      });
    }

    // Vérifier si l'ID est présent
    if (!id) {
      return res.status(400).json({ error: "ID est requis" });
    }

    // Helper function to replace null/undefined with empty string
    const safeValue = (val) => (val === null || val === undefined) ? '' : val;
    
    // Clean name by removing -01 suffix if it exists
    const cleanName = name ? (name.endsWith('-01') ? name.slice(0, -3) : name) : '';
    
    // Use cleaned name as accountcode if not provided
    const accountCodeValue = safeValue(accountcode) || cleanName;
    
    // Map codecs array to a comma-separated string for the 'allow' field
    const allowValue = Array.isArray(codecs) ? codecs.join(',') : (safeValue(codecs));
  
    // Ensure callerid is a string and not null/undefined
    const safeCallerId = safeValue(callerid);
    
    // Handle techprefix - convert to integer, use NULL for empty, '0', or 0
    const safeTechPrefix = techprefix && techprefix !== '0' && techprefix !== 0 ? parseInt(techprefix, 10) : null;
  
    console.log('Processing update with values:', {
      callerid: { value: callerid, type: typeof callerid, safe: safeCallerId },
      techprefix: { value: techprefix, type: typeof techprefix, safe: safeTechPrefix },
      codecs: { value: codecs, type: typeof codecs, allowValue }
    });
  
    // Convertir les champs booléens
    const recordCallValue = record_call === 'yes' ? 1 : 0;
    const blockCallRegValue = block_call_reg === 'yes' ? 1 : 0;
    // allowtransfer: stocker 'no' ou 'yes' directement
    const allowtransferValue = allowtransfer === 'yes' ? 'yes' : 'no';
    // directmedia: stocker 'no' ou 'yes' directement
    const directMediaValue = directmedia === 'yes' ? 'yes' : 'no';
    // Qualify est toujours 'yes' par défaut
    const qualifyValue = 'yes';

    // Requête SQL pour mettre à jour l'utilisateur SIP avec les colonnes requises
    const query = `
      UPDATE pkg_sip 
      SET 
        id_user = ?, name = ?, accountcode = ?, host = ?, 
        status = ?, allow = ?, secret = ?, callerid = ?, 
        alias = ?, sip_group = ?,
        block_call_reg = ?, record_call = ?, techprefix = ?,
        nat = ?, directmedia = ?, qualify = ?, context = ?,
        dtmfmode = ?, insecure = ?, deny = ?, permit = ?,
        type = ?, allowtransfer = ?, calllimit = ?,
        addparameter = ?, dial_timeout = ?,
        voicemail_password = ?, id_trunk_group = ?, defaultuser = ?
      WHERE id = ?
    `;

    // Paramètres de la requête avec les valeurs mises à jour
    const params = [
      safeValue(id_user), 
      safeValue(cleanName), 
      safeValue(accountCodeValue), 
      safeValue(host), 
      safeValue(status), 
      allowValue, 
      safeValue(sippasswd), 
      safeCallerId,
      safeValue(alias), 
      safeValue(sip_group), 
      blockCallRegValue, 
      recordCallValue, 
      safeTechPrefix,
      safeValue(nat) || 'force_rport,comedia', 
      directMediaValue, 
      qualifyValue, 
      safeValue(context) || 'billing',
      safeValue(dtmfmode) || 'RFC2833', 
      safeValue(insecure) || 'no', 
      safeValue(deny), 
      safeValue(permit),
      safeValue(type) || 'friend', 
      allowtransferValue, 
      callLimit || 0, 
      safeValue(addparameter), 
      dial_timeout || 60,
      safeValue(voicemail_email),  // Use safeValue for email fields
      safeValue(voicemail_password) || '',
      0,  // id_trunk_group = 0
      safeValue(cleanName),  // defaultuser
      id
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