const connection = require("../../config/dataBase");

// Fetch all DIDs with user details
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      d.*,  
      u.id AS user_id, 
      u.username 
    FROM 
      pkg_did d
    LEFT JOIN 
      pkg_user u ON d.id_user = u.id
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des DIDs:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun DID trouvé" });
    }

    res.json({ dids: results });
  });
};

// Add a new DID
exports.ajouter = (req, res) => {
  const { did, country, activated, id_user, connection_charge, fixrate, description } = req.body;

  // First, let's check what columns actually exist in the table
  connection.query('DESCRIBE pkg_did', (descError, columns) => {
    if (descError) {
      console.error("Error checking table structure:", descError);
      return res.status(500).json({ error: "Database error", details: descError.message });
    }

    // Get column names from the table structure
    const columnNames = columns.map(col => col.Field);
    console.log('Available columns:', columnNames);

    // Build dynamic query based on existing columns
    let fields = [];
    let placeholders = [];
    let values = [];

    // Always include these basic fields
    if (columnNames.includes('did')) {
      fields.push('did');
      placeholders.push('?');
      values.push(did);
    }

    if (columnNames.includes('country')) {
      fields.push('country');
      placeholders.push('?');
      values.push(country);
    }

    if (columnNames.includes('activated')) {
      fields.push('activated');
      placeholders.push('?');
      values.push(activated);
    }

    if (columnNames.includes('id_user')) {
      fields.push('id_user');
      placeholders.push('?');
      values.push(id_user);
    }

    // Add numeric fields if they exist
    if (columnNames.includes('connection_charge')) {
      fields.push('connection_charge');
      placeholders.push('?');
      values.push(parseFloat(connection_charge) || 0);
    }

    if (columnNames.includes('fixrate')) {
      fields.push('fixrate');
      placeholders.push('?');
      values.push(parseFloat(fixrate) || 0);
    }

    if (columnNames.includes('description')) {
      fields.push('description');
      placeholders.push('?');
      values.push(description || '');
    }

    // Build and execute the query
    const query = `INSERT INTO pkg_did (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log('Executing query:', query);
    console.log('With values:', values);

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error("Erreur lors de l'ajout du DID:", error);
        return res.status(500).json({ error: "Erreur de base de données", details: error.message });
      }

      res.status(201).json({ message: "DID ajouté avec succès", id: results.insertId });
    });
  });
};

// Update a DID
exports.modifier = (req, res) => {
  const didId = req.params.id;
  const { did, country, activated, connection_charge, fixrate, description } = req.body;

  // First, check what columns actually exist in the table
  connection.query('DESCRIBE pkg_did', (descError, columns) => {
    if (descError) {
      console.error("Error checking table structure:", descError);
      return res.status(500).json({ error: "Database error", details: descError.message });
    }

    // Get column names from the table structure
    const columnNames = columns.map(col => col.Field);
    console.log('Available columns for update:', columnNames);

    // Build dynamic SET clause based on existing columns
    let setClauses = [];
    let values = [];

    // Add fields that exist in the table
    if (columnNames.includes('did')) {
      setClauses.push('did = ?');
      values.push(did);
    }

    if (columnNames.includes('country')) {
      setClauses.push('country = ?');
      values.push(country);
    }

    if (columnNames.includes('activated')) {
      setClauses.push('activated = ?');
      values.push(activated);
    }

    if (columnNames.includes('connection_charge')) {
      setClauses.push('connection_charge = ?');
      values.push(parseFloat(connection_charge) || 0);
    }

    if (columnNames.includes('fixrate')) {
      setClauses.push('fixrate = ?');
      values.push(parseFloat(fixrate) || 0);
    }

    if (columnNames.includes('description')) {
      setClauses.push('description = ?');
      values.push(description || '');
    }

    // Add the WHERE clause value
    values.push(didId);

    // Build and execute the query
    const query = `UPDATE pkg_did SET ${setClauses.join(', ')} WHERE id = ?`;
    console.log('Executing update query:', query);
    console.log('With values:', values);

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error("Erreur lors de la mise à jour du DID:", error);
        return res.status(500).json({ error: "Erreur de base de données", details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "DID non trouvé" });
      }

      res.status(200).json({ message: "DID mis à jour avec succès" });
    });
  });
};

// Delete a DID
exports.del = (req, res) => {
  const didId = req.params.id;

  const query = "DELETE FROM pkg_did WHERE id = ?";

  connection.query(query, [didId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du DID:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "DID non trouvé" });
    }

    res.status(200).json({ message: "DID supprimé avec succès" });
  });
};