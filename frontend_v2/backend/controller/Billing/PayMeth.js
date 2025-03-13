const connection = require("../../config/dataBase");

// Afficher toutes les méthodes de paiement avec jointure sur pkg_user
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      pm.id, 
      pm.payment_method, 
      pm.country,
      pm.active, 
      u.username 
    FROM 
      pkg_method_pay pm
    LEFT JOIN 
      pkg_user u ON pm.id_user = u.id
   
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des méthodes de paiement:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucune méthode de paiement trouvée" });
    }

    res.json({ payment_methods: results });
  });
};

// Ajouter une méthode de paiement
exports.ajouter = (req, res) => {
  const { method_name, description, created_by } = req.body;

  if (!method_name || !description || !created_by) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const query = `
    INSERT INTO pkg_method_pay (method_name, description, created_by) 
    VALUES (?, ?, ?)
  `;

  connection.query(query, [method_name, description, created_by], (error, results) => {
    if (error) {
      console.error("Erreur de base de données:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    res.status(201).json({ message: "Méthode de paiement ajoutée avec succès" });
  });
};

// Supprimer une méthode de paiement
exports.del = (req, res) => {
  const methodId = req.params.id;

  if (!methodId) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = "DELETE FROM pkg_method_pay WHERE id = ?";

  connection.query(query, [methodId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la méthode de paiement:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Méthode de paiement non trouvée" });
    }

    res.status(200).json({ message: "Méthode de paiement supprimée avec succès" });
  });
};
