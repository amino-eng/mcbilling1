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

  // Input validation
  if (!did) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "DID number is required",
      field: "did"
    });
  }

  if (!country) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Country is required",
      field: "country"
    });
  }

  // First, let's check what columns actually exist in the table
  connection.query('DESCRIBE pkg_did', (descError, columns) => {
    if (descError) {
      console.error("Error checking table structure:", descError);
      return res.status(500).json({ 
        success: false,
        error: "Database Error",
        message: "Failed to verify database structure"
      });
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

    // Check if DID already exists
    const checkQuery = "SELECT id FROM pkg_did WHERE did = ?";
    connection.query(checkQuery, [did], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for existing DID:", checkErr);
        return res.status(500).json({
          success: false,
          error: "Database Error",
          message: "Failed to verify DID uniqueness"
        });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Duplicate Entry",
          message: `A DID with number ${did} already exists`,
          field: "did"
        });
      }

      // Proceed with insertion if DID doesn't exist
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error adding DID:", error);
          return res.status(500).json({
            success: false,
            error: "Database Error",
            message: "Failed to add DID to the database"
          });
        }

        res.status(201).json({
          success: true,
          message: "DID successfully created",
          data: {
            id: results.insertId,
            did: did,
            country: country
          }
        });
      });
    });
  });
};

// Update a DID
exports.modifier = (req, res) => {
  const didId = req.params.id;
  const { did, country, activated, connection_charge, fixrate, description } = req.body;

  // Input validation
  if (!didId) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "DID ID is required"
    });
  }

  if (!did) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "DID number is required",
      field: "did"
    });
  }

  if (!country) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Country is required",
      field: "country"
    });
  }

  // First, check what columns actually exist in the table
  connection.query('DESCRIBE pkg_did', (descError, columns) => {
    if (descError) {
      console.error("Error checking table structure:", descError);
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: "Failed to verify database structure"
      });
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

    // Check if DID with the same number already exists (excluding current record)
    const checkQuery = "SELECT id FROM pkg_did WHERE did = ? AND id != ?";
    connection.query(checkQuery, [did, didId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for existing DID:", checkErr);
        return res.status(500).json({
          success: false,
          error: "Database Error",
          message: "Failed to verify DID uniqueness"
        });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Duplicate Entry",
          message: `A DID with number ${did} already exists`,
          field: "did"
        });
      }

      // Check if the record exists before updating
      const checkExistence = "SELECT id FROM pkg_did WHERE id = ?";
      connection.query(checkExistence, [didId], (existErr, existResults) => {
        if (existErr) {
          console.error("Error checking DID existence:", existErr);
          return res.status(500).json({
            success: false,
            error: "Database Error",
            message: "Failed to verify DID existence"
          });
        }

        if (existResults.length === 0) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: `DID with ID ${didId} not found`
          });
        }

        // Proceed with update
        connection.query(query, values, (error, results) => {
          if (error) {
            console.error("Error updating DID:", error);
            return res.status(500).json({
              success: false,
              error: "Database Error",
              message: "Failed to update DID in the database"
            });
          }


          res.status(200).json({
            success: true,
            message: "DID successfully updated",
            data: {
              id: didId,
              did: did,
              country: country
            }
          });
        });
      });
    });
  });
};

// Delete a DID
exports.del = (req, res) => {
  const didId = req.params.id;

  // Input validation
  if (!didId) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "DID ID is required"
    });
  }

  // Check if DID exists first
  const checkQuery = "SELECT id, did FROM pkg_did WHERE id = ?";
  connection.query(checkQuery, [didId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking DID existence:", checkErr);
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: "Failed to verify DID existence"
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `DID with ID ${didId} not found`
      });
    }

    const didNumber = checkResults[0].did;
    const query = "DELETE FROM pkg_did WHERE id = ?";

    connection.query(query, [didId], (err, result) => {
      if (err) {
        console.error("Error deleting DID:", err);
        
        // Check for foreign key constraint violation
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED_1') {
          return res.status(409).json({
            success: false,
            error: "Operation Not Allowed",
            message: "Cannot delete DID because it is referenced by other records"
          });
        }
        
        return res.status(500).json({ 
          success: false,
          error: "Database Error", 
          message: "Failed to delete DID from the database"
        });
      }

      res.status(200).json({ 
        success: true,
        message: `DID ${didNumber} successfully deleted`,
        data: {
          id: didId,
          did: didNumber
        }
      });
    });
  });
};