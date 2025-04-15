const connection = require("../../config/dataBase");

// Fetch all trunks with provider details
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      t.*, 
      p.provider_name AS provider_name,
      p.description AS provider_description
    FROM 
      pkg_trunk t
    LEFT JOIN 
      pkg_provider p 
    ON 
      t.id_provider = p.id
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des trunks:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun trunk trouvé" });
    }

    res.json({ trunks: results });
  });
};

// Helper function to replace undefined or empty string with default values
const replaceUndefinedWithDefault = (value, defaultValue) => {
  if (value === undefined || value === "") {
    return defaultValue; // Use the default value if undefined or empty string
  }
  return value; // Otherwise, use the original value
};

// Add a new trunk
exports.ajouter = (req, res) => {
  const {
    id_provider,
    trunkcode,
    host,
    fromdomain,
    providertech,
    providerip,
    trunkprefix,
    removeprefix,
    creationdate,
    user,
    secret,
    allow,
    context,
    dtmfmode,
    insecure,
    nat,
    qualify,
    type,
    disallow,
    port,
    sendrpid,
    directmedia,
    sms_res
  } = req.body;

  // Default values based on your table schema
  const defaultValues = {
    failover_trunk: null,
    secondusedreal: 0,
    call_answered: 0,
    call_total: 0,
    addparameter: null,
    inuse: 0,
    maxuse: -1,
    status: 1,
    if_max_use: 0,
    link_sms: '',
    register: 0,
    language: '',
    allow_error: 0,
    short_time_call: 0,
    fromuser: '',
    register_string: '',
    transport: 'no',
    encryption: 'no',
    cnl: 0,
    cid_add: '',
    cid_remove: '',
    block_cid: '',
    sip_config: null
  };

  // Build values array with default handling
  // IMPORTANT: For sms_res, use empty string instead of null since the column is NOT NULL
  const values = [
    replaceUndefinedWithDefault(id_provider, null),
    replaceUndefinedWithDefault(trunkcode, null),
    replaceUndefinedWithDefault(host, null),
    replaceUndefinedWithDefault(fromdomain, ''),
    replaceUndefinedWithDefault(providertech, ''),
    replaceUndefinedWithDefault(providerip, ''),
    replaceUndefinedWithDefault(trunkprefix, ''),
    replaceUndefinedWithDefault(removeprefix, ''),
    replaceUndefinedWithDefault(creationdate, null),
    replaceUndefinedWithDefault(user, ''),
    replaceUndefinedWithDefault(secret, ''),
    replaceUndefinedWithDefault(allow, ''),
    replaceUndefinedWithDefault(context, ''),
    replaceUndefinedWithDefault(dtmfmode, ''),
    replaceUndefinedWithDefault(insecure, ''),
    replaceUndefinedWithDefault(nat, ''),
    replaceUndefinedWithDefault(qualify, ''),
    replaceUndefinedWithDefault(type, ''),
    replaceUndefinedWithDefault(disallow, ''),
    replaceUndefinedWithDefault(port, 0),
    replaceUndefinedWithDefault(sendrpid, ''),
    replaceUndefinedWithDefault(directmedia, ''),
    replaceUndefinedWithDefault(sms_res, ''), // Changed from null to empty string
    defaultValues.failover_trunk,
    defaultValues.secondusedreal,
    defaultValues.call_answered,
    defaultValues.call_total,
    defaultValues.addparameter,
    defaultValues.inuse,
    defaultValues.maxuse,
    defaultValues.status,
    defaultValues.if_max_use,
    defaultValues.link_sms,
    defaultValues.register,
    defaultValues.language,
    defaultValues.allow_error,
    defaultValues.short_time_call,
    defaultValues.fromuser,
    defaultValues.register_string,
    defaultValues.transport,
    defaultValues.encryption,
    defaultValues.cnl,
    defaultValues.cid_add,
    defaultValues.cid_remove,
    defaultValues.block_cid,
    defaultValues.sip_config
  ];

  // Debugging: log the final values to insert
  console.log("Values to Insert count:", values.length);

  const query = `
    INSERT INTO pkg_trunk (
      id_provider, trunkcode, host, fromdomain, providertech, providerip,
      trunkprefix, removeprefix, creationdate, user, secret,
      allow, context, dtmfmode, insecure, nat, qualify,
      type, disallow, port, sendrpid, directmedia, sms_res,
      failover_trunk, secondusedreal, call_answered, call_total,
      addparameter, inuse, maxuse, status, if_max_use,
      link_sms, register, language, allow_error, short_time_call,
      fromuser, register_string, transport, encryption, cnl,
      cid_add, cid_remove, block_cid, sip_config
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Count placeholders to ensure they match values
  const placeholderCount = (query.match(/\?/g) || []).length;
  if (placeholderCount !== values.length) {
    console.error(`Error: Column count (${placeholderCount}) and value count (${values.length}) mismatch`);
    return res.status(500).json({ 
      error: "Column count and value count mismatch", 
      expected: placeholderCount, 
      actual: values.length 
    });
  }

  // Insert the data into the database
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error adding trunk:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    res.status(201).json({
      message: "Trunk added successfully",
      id: results.insertId
    });
  });
};

// Update one or more trunks
exports.batchUpdate = (req, res) => {
  const { trunkIds, ...fields } = req.body;

  if (!trunkIds || trunkIds.length === 0) {
    return res.status(400).json({ error: "Aucun trunk sélectionné pour mise à jour" });
  }

  const updateFields = {};
  for (let key in fields) {
    if (fields[key] !== undefined) {
      updateFields[key] = fields[key];
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "Aucun champ valide fourni pour mise à jour" });
  }

  const query = `
    UPDATE pkg_trunk 
    SET ?
    WHERE id IN (?)
  `;

  connection.query(query, [updateFields, trunkIds], (error, results) => {
    if (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return res.status(500).json({ 
        error: "Échec de l'opération en base de données",
        details: error.message
      });
    }

    res.status(200).json({ 
      message: `Mise à jour réussie de ${results.affectedRows} trunk(s)`,
      updatedCount: results.affectedRows
    });
  });
};

// Delete a trunk
exports.deleted = (req, res) => {
  const trunkId = req.params.id;

  const query = "DELETE FROM pkg_trunk WHERE id = ?";

  connection.query(query, [trunkId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du trunk:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trunk non trouvé" });
    }

    res.status(200).json({ message: "Trunk supprimé avec succès" });
  });
};

