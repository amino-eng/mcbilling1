const connection = require("../../config/dataBase");

// Get all prefixes
exports.afficher = (req, res) => {
  const query = "SELECT * FROM pkg_prefix";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des préfixes:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun préfixe trouvé" });
    }

    res.json({ prefixes: results });
  });
};

// Add a new prefix
exports.ajouter = (req, res) => {
  const {
    prefix, destination
  } = req.body;

  const query = `
    INSERT INTO pkg_prefix 
    (prefix, destination)
    VALUES (?, ?)
  `;

  const values = [
    prefix, destination
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du préfixe:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.status(201).json({
      message: "Préfixe ajouté avec succès",
      id: result.insertId
    });
  });
};

// Update a prefix
exports.modifier = (req, res) => {
    const id=req.params.id
  const {
     prefix,destination
  } = req.body;

  const query = `
    UPDATE pkg_prefix SET
      prefix = ?, destination = ?
    WHERE id = ?
  `;

  const values = [
    prefix, destination,id
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la modification du préfixe:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.status(200).json({ message: "Préfixe modifié avec succès" });
  });
};

// Delete a prefix
exports.supprimer = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM pkg_prefix WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du préfixe:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Préfixe non trouvé" });
    }

    res.json({ message: "Préfixe supprimé avec succès" });
  });
};
