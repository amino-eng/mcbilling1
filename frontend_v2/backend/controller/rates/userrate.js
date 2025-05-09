const connection = require("../../config/dataBase");

// Get all user rates with joins
exports.afficher = (req, res) => {
  const query = `
  SELECT 
  ur.*, 
  u.username, 
  p.prefix, 
  p.destination
FROM pkg_user_rate AS ur
LEFT JOIN pkg_user AS u ON ur.id_user = u.id
LEFT JOIN pkg_prefix AS p ON ur.id_prefix = p.id;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur récupération user rates:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    res.json({ userRates: results });
  });
};

// Add new user rate
exports.ajouter = (req, res) => {
  const { id_user, id_prefix, rate } = req.body;

  if (!id_user || !id_prefix || rate == null) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const query = `
    INSERT INTO pkg_user_rate (id_user, id_prefix, rate)
    VALUES (?, ?, ?)
  `;

  connection.query(query, [id_user, id_prefix, rate], (err, result) => {
    if (err) {
      console.error("Erreur ajout user rate:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    res.status(201).json({ message: "User rate ajouté avec succès", id: result.insertId });
  });
};

// Update user rate
exports.modifier = (req, res) => {
  const id = req.params.id;
  const { id_user, id_prefix, rate } = req.body;

  if (!id_user || !id_prefix || rate == null) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const query = `
    UPDATE pkg_user_rate 
    SET id_user = ?, id_prefix = ?, rate = ?
    WHERE id = ?
  `;

  connection.query(query, [id_user, id_prefix, rate, id], (err, result) => {
    if (err) {
      console.error("Erreur modification user rate:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User rate non trouvé" });
    }

    res.json({ message: "User rate modifié avec succès" });
  });
};

// Delete user rate
exports.supprimer = (req, res) => {
  const id = req.params.id;

  connection.query("DELETE FROM pkg_user_rate WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression user rate:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User rate non trouvé" });
    }

    res.json({ message: "User rate supprimé avec succès" });
  });
};
