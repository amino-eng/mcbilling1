const connection = require("../../config/dataBase");

// Fetch all DIDs with user details
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      d.*,  -- Select all columns from pkg_did
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
  const { did_number, country, active, id_user } = req.body;

  if (!did_number || !country || active === undefined || !id_user) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const query = `
    INSERT INTO pkg_did (did_number, country, active, id_user) 
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [did_number, country, active, id_user], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'ajout du DID:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    res.status(201).json({ message: "DID ajouté avec succès", id: results.insertId });
  });
};

// Update a DID
exports.modifier = (req, res) => {
  const didId = req.params.id;
  const { did_number, country, active, id_user } = req.body;

  if (!did_number || !country || active === undefined || !id_user) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const query = `
    UPDATE pkg_did 
    SET did_number = ?, country = ?, active = ?, id_user = ? 
    WHERE id = ?
  `;

  connection.query(query, [did_number, country, active, id_user, didId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la mise à jour du DID:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "DID non trouvé" });
    }

    res.status(200).json({ message: "DID mis à jour avec succès" });
  });
};

// Delete a DID
exports.del = (req, res) => {
  const didId = req.params.id;

  if (!didId) {
    return res.status(400).json({ error: "ID est requis" });
  }

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
