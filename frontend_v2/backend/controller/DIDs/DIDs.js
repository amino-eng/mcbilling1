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
    const { did, country, activated, id_user } = req.body;

    const query = `
      INSERT INTO pkg_did (did, country, activated, id_user) 
      VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [did, country, activated, id_user], (error, results) => {
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
    const { did, country, activated } = req.body;

    const query = `
      UPDATE pkg_did 
      SET did = ?, country = ?, activated = ? 
      WHERE id = ?
    `;

    connection.query(query, [did, country, activated, didId], (error, results) => {
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