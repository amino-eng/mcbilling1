const connection = require("../../config/dataBase");

// Fetch all providers
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      id,
      provider_name,
      creationdate,
      description,
      credit,
      credit_control
    FROM 
      pkg_provider 
    ORDER BY 
      creationdate DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des providers:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun provider trouvé" });
    }

    res.json({ providers: results });
  });
};

// Add a new provider
exports.ajouter = (req, res) => {
  const { provider_name, creationdate, description, credit, credit_control } = req.body;
  
  if (!provider_name) {
    return res.status(400).json({ 
      success: false,
      error: "Le nom du provider est requis",
      message: "Veuillez fournir un nom pour le provider" 
    });
  }
  
  let crd = credit_control === 1 ? 1 : 0;

  const query = `
    INSERT INTO pkg_provider (provider_name, creationdate, description, credit, credit_control) 
    VALUES (?, ?, ?, ?, ?)`;

  connection.query(query, [provider_name, creationdate, description, credit, crd], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'ajout du provider:", error);
      return res.status(500).json({ 
        success: false,
        error: "Erreur lors de l'ajout du provider",
        message: "Une erreur est survenue lors de la création du provider" 
      });
    }

    res.status(201).json({ 
      success: true,
      message: `Provider ${provider_name} a été créé avec succès`,
      id: results.insertId 
    });
  });
};

// Update a provider

exports.batchUpdate = async (req, res) => {
  console.log('Batch update request received:', req.body);
  
  const { providerIds, name, creationdate, description, credit, credit_control } = req.body;
  
  if (!providerIds || !Array.isArray(providerIds) || providerIds.length === 0) {
    console.error('No valid provider IDs provided:', providerIds);
    return res.status(400).json({ 
      success: false,
      error: "No valid providers selected for update" 
    });
  }

  // Build the update object with only provided fields
  const updateFields = {};
  if (name !== undefined) updateFields.provider_name = name;
  if (creationdate !== undefined) updateFields.creationdate = creationdate;
  if (description !== undefined) updateFields.description = description;
  if (credit !== undefined) updateFields.credit = parseFloat(credit);
  if (credit_control !== undefined) {
    updateFields.credit_control = credit_control === "yes" ? 1 : 0;
  }

  if (Object.keys(updateFields).length === 0) {
    console.error('No valid fields to update');
    return res.status(400).json({ 
      success: false,
      error: "No valid fields provided for update" 
    });
  }

  console.log('Preparing to update providers with:', {
    providerIds,
    updateFields
  });

  console.log('Starting batch update with data:', JSON.stringify({
    providerIds,
    name,
    creationdate,
    description,
    credit,
    credit_control
  }, null, 2));

  // First, check if the table and columns exist
  const checkTableQuery = `
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mbilling' 
    AND TABLE_NAME = 'pkg_provider'
    AND COLUMN_NAME IN ('id', 'provider_name', 'creationdate', 'description', 'credit', 'credit_control')
  `;

  try {
    const [columns] = await connection.promise().query(checkTableQuery);
    console.log('Table structure:', columns);
    
    if (columns.length === 0) {
      throw new Error('pkg_provider table does not exist or has no matching columns');
    }
    
    // Check if all required columns exist
    const columnNames = columns.map(col => col.COLUMN_NAME);
    const missingColumns = [];
    
    if (!columnNames.includes('id')) missingColumns.push('id');
    if (updateFields.provider_name && !columnNames.includes('provider_name')) missingColumns.push('provider_name');
    if (updateFields.creationdate && !columnNames.includes('creationdate')) missingColumns.push('creationdate');
    if (updateFields.description && !columnNames.includes('description')) missingColumns.push('description');
    if (updateFields.credit && !columnNames.includes('credit')) missingColumns.push('credit');
    if (updateFields.credit_control !== undefined && !columnNames.includes('credit_control')) missingColumns.push('credit_control');
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns in pkg_provider table: ${missingColumns.join(', ')}`);
    }
  } catch (error) {
    console.error('Error checking table structure:', error);
    return res.status(500).json({
      success: false,
      error: 'Database structure error',
      details: error.message
    });
  }

  // Log the raw SQL query for debugging
  const query = `
    UPDATE pkg_provider 
    SET ?
    WHERE id IN (?)
  `;
  
  console.log('Update fields after initial processing:', JSON.stringify(updateFields, null, 2));
  
  // Check for duplicate provider_name if we're updating it
  if (updateFields.provider_name) {
    try {
      // If we're setting the same name for multiple providers, it will always cause a duplicate
      if (providerIds.length > 1) {
        console.log(`Cannot set the same name for multiple providers (${providerIds.length} selected)`);
        return res.status(400).json({
          success: false,
          error: 'Cannot set the same name for multiple providers',
          details: `You are trying to set the same name '${updateFields.provider_name}' for ${providerIds.length} providers`,
          field: 'name',
          value: updateFields.provider_name
        });
      }
      
      // For a single provider, check if the name is already used by any other provider
      const [existing] = await connection.promise().query(
        'SELECT id, provider_name FROM pkg_provider WHERE provider_name = ? AND id != ?',
        [updateFields.provider_name, providerIds[0]]
      );
      
      if (existing.length > 0) {
        console.log(`Provider name '${updateFields.provider_name}' is already in use by provider ID ${existing[0].id}`);
        return res.status(400).json({
          success: false,
          error: 'Provider name already in use',
          details: `The name '${updateFields.provider_name}' is already used by another provider`,
          field: 'name',
          value: updateFields.provider_name
        });
      }
    } catch (checkError) {
      console.error('Error checking for duplicate provider name:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Error validating provider name',
        details: checkError.message
      });
    }
  }

  console.log('Generated SQL:', query);
  console.log('Parameters:', JSON.stringify({
    updateFields,
    providerIds
  }, null, 2));

  try {
    console.log('Executing query with params:', JSON.stringify({
      query,
      updateFields,
      providerIds,
      providerIdsLength: providerIds.length,
      providerIdsType: typeof providerIds[0],
      providerIdsValues: providerIds
    }, null, 2));
    
    // Verify database connection
    if (!connection) {
      const errorMsg = 'Database connection not available';
      console.error(errorMsg);
      return res.status(500).json({
        success: false,
        error: errorMsg,
        details: 'Database connection is not initialized'
      });
    }
    
    // Ensure we have fields to update
    if (Object.keys(updateFields).length === 0) {
      const errorMsg = 'No valid fields to update after validation';
      console.error(errorMsg, { originalFields: { name, creationdate, description, credit, credit_control } });
      return res.status(400).json({
        success: false,
        error: errorMsg,
        details: 'All fields were either empty or invalid after processing',
        originalFields: { name, creationdate, description, credit, credit_control }
      });
    }
    
    let results;
    try {
      // If we're down to no fields to update after validation, exit early
      if (Object.keys(updateFields).length === 0) {
        console.log('No fields to update after validation');
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update',
          details: 'All fields were either invalid or not provided'
        });
      }
      
      // Execute the query directly with proper parameter binding
      const [queryResults] = await connection.promise().query(
        'UPDATE pkg_provider SET ? WHERE id IN (?)',
        [updateFields, providerIds]
      );
      results = queryResults;
      console.log('Query executed successfully, affected rows:', results.affectedRows);
    } catch (dbError) {
      console.error('Database query error:', {
        message: dbError.message,
        code: dbError.code,
        errno: dbError.errno,
        sql: dbError.sql,
        sqlMessage: dbError.sqlMessage,
        sqlState: dbError.sqlState
      });
      
      // If there's a duplicate entry error, provide more context
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          error: 'Duplicate entry',
          details: dbError.sqlMessage,
          field: 'provider_name',
          value: updateFields.provider_name
        });
      }
      
      throw dbError; // Re-throw to be caught by the outer try-catch
    }
    
    console.log(`Successfully updated ${results.affectedRows} providers`);
    
    const response = { 
      success: true,
      message: `Successfully updated ${results.affectedRows} providers`,
      updatedCount: results.affectedRows
    };
    
    // Add info if name was skipped
    if (name && !updateFields.provider_name) {
      response.skippedNameUpdate = true;
      response.message += ' (provider name not updated - already in use)';
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Database error:", {
      message: error.message,
      sql: error.sql,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return res.status(500).json({ 
      success: false,
      error: "Database operation failed",
      details: error.message,
      code: error.code
    });
  }
};

// Update single provider
exports.modifier = (req, res) => {
  const providerId = req.params.id;
  const { provider_name, creationdate, description, credit, credit_control } = req.body;
  
  if (!provider_name) {
    return res.status(400).json({ 
      success: false,
      error: "Le nom du provider est requis",
      message: "Veuillez fournir un nom pour le provider" 
    });
  }
  
  let crd = credit_control === 1 ? 1 : 0;

  const query = `
    UPDATE pkg_provider 
    SET provider_name = ?, creationdate = ?, description = ?, credit = ?, credit_control = ?
    WHERE id = ?
  `;

  connection.query(query, [provider_name, creationdate, description, credit, crd, providerId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la modification du provider:", error);
      return res.status(500).json({ 
        success: false,
        error: "Erreur lors de la modification du provider",
        message: "Une erreur est survenue lors de la mise à jour du provider" 
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Provider non trouvé",
        message: "Le provider spécifié n'existe pas" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: `Provider ${provider_name} a été mis à jour avec succès`
    });
  });
};

// Delete a provider
exports.del = (req, res) => {
  const providerId = req.params.id;

  const query = "DELETE FROM pkg_provider WHERE id = ?";

  connection.query(query, [providerId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du provider:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Provider non trouvé" });
    }

    res.status(200).json({ message: "Provider supprimé avec succès" });
  });
};
