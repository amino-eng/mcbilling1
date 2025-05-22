const connection = require("../../config/dataBase")

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
  `

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des trunks:", err.message)
      return res.status(500).json({ error: "Erreur de base de données", details: err.message })
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun trunk trouvé" })
    }

    res.json({ trunks: results })
  })
}

// Helper function to replace undefined or empty string with default values
const replaceUndefinedWithDefault = (value, defaultValue) => {
  if (value === undefined || value === "") {
    return defaultValue // Use the default value if undefined or empty string
  }
  return value // Otherwise, use the original value
}

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
    sms_res,
  } = req.body

  // Helper function to replace undefined or empty string with default values
  const replaceUndefinedWithDefault = (value, defaultValue) => {
    if (value === undefined || value === "") {
      return defaultValue
    }
    return value
  }

  // Convert allow array to string if needed
  const allowValue = Array.isArray(allow) ? allow.join(",") : allow || ""

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
    link_sms: "",
    register: 0,
    language: "",
    allow_error: 0,
    short_time_call: 0,
    fromuser: "",
    register_string: "",
    transport: "no",
    encryption: "no",
    cnl: 0,
    cid_add: "",
    cid_remove: "",
    block_cid: "",
    sip_config: null,
  }

  // Build values array with default handling
  const values = [
    replaceUndefinedWithDefault(id_provider, null),
    replaceUndefinedWithDefault(trunkcode, null),
    replaceUndefinedWithDefault(host, null),
    replaceUndefinedWithDefault(fromdomain, ""),
    replaceUndefinedWithDefault(providertech, ""),
    replaceUndefinedWithDefault(providerip, ""),
    replaceUndefinedWithDefault(trunkprefix, ""),
    replaceUndefinedWithDefault(removeprefix, ""),
    replaceUndefinedWithDefault(creationdate, null),
    replaceUndefinedWithDefault(user, ""),
    replaceUndefinedWithDefault(secret, ""),
    allowValue,
    replaceUndefinedWithDefault(context, ""),
    replaceUndefinedWithDefault(dtmfmode, ""),
    replaceUndefinedWithDefault(insecure, ""),
    replaceUndefinedWithDefault(nat, ""),
    replaceUndefinedWithDefault(qualify, ""),
    replaceUndefinedWithDefault(type, ""),
    replaceUndefinedWithDefault(disallow, ""),
    replaceUndefinedWithDefault(port, 0),
    replaceUndefinedWithDefault(sendrpid, ""),
    replaceUndefinedWithDefault(directmedia, ""),
    replaceUndefinedWithDefault(sms_res, ""),
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
    defaultValues.sip_config,
  ]

  // Debugging: log the final values to insert
  console.log("Values to Insert count:", values.length)
  console.log("Allow value:", allowValue)

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
  `

  // Count placeholders to ensure they match values
  const placeholderCount = (query.match(/\?/g) || []).length
  if (placeholderCount !== values.length) {
    console.error(`Error: Column count (${placeholderCount}) and value count (${values.length}) mismatch`)
    return res.status(500).json({
      error: "Column count and value count mismatch",
      expected: placeholderCount,
      actual: values.length,
    })
  }

  // Insert the trunk without using transactions
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error adding trunk:", error)
      return res.status(500).json({ error: "Database error", details: error.message })
    }

    const trunkId = results.insertId

    // If no allow values provided, we're done
    if (!Array.isArray(allow) || allow.length === 0) {
      return res.status(201).json({
        message: "Trunk added successfully",
        id: trunkId,
      })
    }

    // Prepare values for bulk insertion
    const allowValues = allow.map((value, index) => [trunkId, value, index])

    // Insert allow values into the relational table
    // IMPORTANT: Fixed table name to pkg_trunk_allow
    const allowQuery = `
      INSERT INTO pkg_trunk_allow (trunk_id, allow_value, priority)
      VALUES ?
    `

    connection.query(allowQuery, [allowValues], (error) => {
      if (error) {
        console.error("Error adding allow values:", error)
        // Note: We can't rollback here since we're not using transactions
        // In a production app, you might want to add code to delete the trunk if this fails
        return res.status(500).json({ 
          error: "Database error when adding allow values", 
          details: error.message,
          warning: "Trunk was created but allow values failed to insert"
        })
      }

      res.status(201).json({
        message: "Trunk added successfully with allow values",
        id: trunkId,
        allowCount: allow.length,
      })
    })
  })
}

// Fonction pour récupérer un trunk avec ses valeurs allow
exports.getTrunk = (req, res) => {
  const id = req.params.id

  // Requête pour obtenir le trunk principal
  const trunkQuery = "SELECT * FROM pkg_trunk WHERE id = ?"

  connection.query(trunkQuery, [id], (error, trunkResults) => {
    if (error) {
      console.error("Error fetching trunk:", error)
      return res.status(500).json({ error: "Database error", details: error.message })
    }

    if (trunkResults.length === 0) {
      return res.status(404).json({ message: "Trunk not found" })
    }

    const trunk = trunkResults[0]

    // Requête pour obtenir les valeurs allow associées
    const allowQuery = "SELECT * FROM pkg_trunk WHERE id = ? ORDER BY priority"

    connection.query(allowQuery, [id], (error, allowResults) => {
      if (error) {
        console.error("Error fetching allow values:", error)
        return res.status(500).json({ error: "Database error", details: error.message })
      }

      // Extraire les valeurs allow
      trunk.allowValues = allowResults.map((row) => row.allow_value)

      // Pour la compatibilité, conserver également la chaîne allow originale
      if (!trunk.allow) {
        trunk.allow = trunk.allowValues.join(",")
      }

      res.json({ trunk })
    })
  })
}

// Fonction pour mettre à jour un trunk et ses valeurs allow
// Fonction pour mettre à jour un trunk et ses valeurs allow

exports.modifier = (req, res) => {
  const id = req.params.id;
  let { allow, ...otherFields } = req.body;

  // Function to replace undefined or empty values with default
  const replaceUndefinedWithDefault = (value, defaultValue) => {
    return value === undefined || value === "" ? defaultValue : value;
  };

  // Handle allow as string or array
  const allowValue = Array.isArray(allow) ? allow.join(",") : allow || "";

  // Default values to avoid SQL errors
  const defaultValues = {
    fromdomain: "",
    providertech: "",
    providerip: "",
    trunkprefix: "",
    removeprefix: "",
    creationdate: null,
    user: "",
    secret: "",
    context: "",
    dtmfmode: "",
    insecure: "",
    nat: "",
    qualify: "",
    type: "",
    disallow: "",
    port: 0,
    sendrpid: "",
    directmedia: "",
    sms_res: "",
    failover_trunk: null,
    secondusedreal: 0,
    call_answered: 0,
    call_total: 0,
    addparameter: null,
    inuse: 0,
    maxuse: -1,
    status: 1,
    if_max_use: 0,
    link_sms: "",
    register: 0,
    language: "",
    allow_error: 0,
    short_time_call: 0,
    fromuser: "",
    register_string: "",
    transport: "no",
    encryption: "no",
    cnl: 0,
    cid_add: "",
    cid_remove: "",
    block_cid: "",
    sip_config: null,
  };

  // Apply default values
  for (const [key, defaultVal] of Object.entries(defaultValues)) {
    otherFields[key] = replaceUndefinedWithDefault(otherFields[key], defaultVal);
  }

  // Data to update, including allow string
  const updateData = {
    ...otherFields,
    allow: allowValue,
  };

  console.log("ID du trunk à modifier:", id);
  console.log("Données à mettre à jour:", updateData);

  // Simple update without transactions, deletes, or inserts
  const updateQuery = "UPDATE pkg_trunk SET ? WHERE id = ?";

  connection.query(updateQuery, [updateData, id], (error, results) => {
    if (error) {
      console.error("Erreur lors de la mise à jour du trunk:", error);
      return res.status(500).json({ 
        error: "Erreur de base de données", 
        details: error.message 
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        message: "Trunk non trouvé" 
      });
    }

    res.json({
      message: "Trunk mis à jour avec succès",
      id: id,
    });
  });
};
// Delete a trunk
exports.deleted = (req, res) => {
  const trunkId = req.params.id

  const query = "DELETE FROM pkg_trunk WHERE id = ?"

  connection.query(query, [trunkId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du trunk:", err)
      return res.status(500).json({ error: "Erreur de base de données", details: err.message })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trunk non trouvé" })
    }

    res.status(200).json({ message: "Trunk supprimé avec succès" })
  })
}

// Fonction pour récupérer tous les providers (si nécessaire)
exports.getAllProviders = (req, res) => {
  const query = "SELECT id, provider_name, description FROM pkg_provider ORDER BY provider_name"

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des providers:", err.message)
      return res.status(500).json({ error: "Erreur de base de données", details: err.message })
    }

    res.json({ providers: results })
  })
}

// Implémentation de la fonction batchUpdate manquante
exports.batchUpdate = (req, res) => {
  const { trunks } = req.body

  if (!Array.isArray(trunks) || trunks.length === 0) {
    return res.status(400).json({ error: "Données invalides. Un tableau de trunks est requis." })
  }

  // Utiliser une transaction pour garantir l'intégrité des données
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }

    const updatePromises = trunks.map((trunk) => {
      return new Promise((resolve, reject) => {
        const { id, ...updateData } = trunk

        if (!id) {
          return reject(new Error("ID manquant pour un trunk"))
        }

        const query = "UPDATE pkg_trunk SET ? WHERE id = ?"

        connection.query(query, [updateData, id], (error, results) => {
          if (error) {
            return reject(error)
          }

          if (results.affectedRows === 0) {
            return reject(new Error(`Trunk avec ID ${id} non trouvé`))
          }

          resolve({ id, success: true })
        })
      })
    })

    Promise.all(updatePromises.map((p) => p.catch((e) => e)))
      .then((results) => {
        const errors = results.filter((result) => result instanceof Error)

        if (errors.length > 0) {
          return connection.rollback(() => {
            console.error("Errors during batch update:", errors)
            res.status(500).json({
              error: "Erreurs lors de la mise à jour par lot",
              details: errors.map((e) => e.message),
            })
          })
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err)
              res.status(500).json({ error: "Database error", details: err.message })
            })
          }

          res.json({
            message: "Mise à jour par lot réussie",
            results: results,
          })
        })
      })
      .catch((error) => {
        connection.rollback(() => {
          console.error("Error in batch update:", error)
          res.status(500).json({ error: "Database error", details: error.message })
        })
      })
  })
}
