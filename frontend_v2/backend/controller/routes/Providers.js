const connection = require("../../config/dataBase");

// Fetch all providers
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      *  
      
    FROM 
      pkg_provider 
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
  const { name, creationdate, description, credit, credit_control } = req.body;
  let crd=0
if(credit_control=="yes"){
  crd=1
} 

  const query = `
    INSERT INTO pkg_provider (provider_name, creationdate, description, credit, credit_control) 
    VALUES (?, ?, ?, ?,?)
  `;

  connection.query(query, [name, creationdate, description, credit, crd], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'ajout du provider:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    res.status(201).json({ message: "Provider ajouté avec succès", id: results.insertId });
  });
};

// Update a provider

exports.batchUpdate = (req, res) => {
  const { providerIds, name, creationdate, description, credit, credit_control } = req.body;
  
  if (!providerIds || providerIds.length === 0) {
    return res.status(400).json({ error: "No providers selected for update" });
  }

  // Build the update object with only provided fields
  const updateFields = {};
  if (name) updateFields.provider_name = name;
  if (creationdate) updateFields.creationdate = creationdate;
  if (description) updateFields.description = description;
  if (credit) updateFields.credit = parseFloat(credit); // Ensure numeric value
  if (credit_control) updateFields.credit_control = credit_control === "yes" ? 1 : 0;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }

  const query = `
    UPDATE pkg_provider 
    SET ?
    WHERE id IN (?)
  `;

  connection.query(query, [updateFields, providerIds], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ 
        error: "Database operation failed",
        details: error.message,
        sql: error.sql
      });
    }

    res.status(200).json({ 
      message: `Successfully updated ${results.affectedRows} providers`,
      updatedCount: results.affectedRows
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
