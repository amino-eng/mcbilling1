const connection = require("../../config/dataBase");

// 📥 Afficher tous les trunk errors
exports.afficher = (req, res) => {
  const query = `SELECT * FROM pkg_trunk_error`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des trunk errors:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucune erreur de trunk trouvée" });
    }

    res.json({ trunkErrors: results });
  });
};

// ➕ Ajouter une nouvelle erreur de trunk
exports.ajouter = (req, res) => {
  const { trunk_id, error_type, description, timestamp } = req.body;

  const query = `
    INSERT INTO pkg_trunk_error (trunk_id, error_type, description, timestamp)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [trunk_id, error_type, description, timestamp], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'ajout de l'erreur de trunk:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    res.status(201).json({ message: "Erreur de trunk ajoutée avec succès", id: results.insertId });
  });
};

// ✏️ Modifier une erreur de trunk
exports.update = (req, res) => {
  const { id, trunk_id, error_type, description, timestamp } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID requis pour la mise à jour" });
  }

  const query = `
    UPDATE pkg_trunk_error
    SET trunk_id = ?, error_type = ?, description = ?, timestamp = ?
    WHERE id = ?
  `;

  connection.query(query, [trunk_id, error_type, description, timestamp, id], (error, results) => {
    if (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Erreur de trunk non trouvée" });
    }

    res.status(200).json({ message: "Erreur de trunk mise à jour avec succès" });
  });
};

// ❌ Supprimer une erreur de trunk
exports.del = (req, res) => {
  const errorId = req.params.id;

  const query = `DELETE FROM pkg_trunk_error WHERE id = ?`;

  connection.query(query, [errorId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'erreur de trunk:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Erreur de trunk non trouvée" });
    }

    res.status(200).json({ message: "Erreur de trunk supprimée avec succès" });
  });
};
