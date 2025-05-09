const connection = require("../../config/dataBase");

// Get all offers
exports.afficher = (req, res) => {
  const query = "SELECT * FROM pkg_offer";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur récupération des offres:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    res.json({ offers: results });
  });
};

// Add new offer
exports.ajouter = (req, res) => {
  const { offer_name, description, price, validity } = req.body;

  if (!offer_name || !description || price == null || !validity) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const query = `
    INSERT INTO pkg_offer (offer_name, description, price, validity)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [offer_name, description, price, validity], (err, result) => {
    if (err) {
      console.error("Erreur ajout offre:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    res.status(201).json({ message: "Offre ajoutée avec succès", id: result.insertId });
  });
};

// Update offer
exports.modifier = (req, res) => {
  const id = req.params.id;
  const { offer_name, description, price, validity } = req.body;

  if (!offer_name || !description || price == null || !validity) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const query = `
    UPDATE pkg_offer
    SET offer_name = ?, description = ?, price = ?, validity = ?
    WHERE id = ?
  `;

  connection.query(query, [offer_name, description, price, validity, id], (err, result) => {
    if (err) {
      console.error("Erreur modification offre:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    res.json({ message: "Offre modifiée avec succès" });
  });
};

// Delete offer
exports.supprimer = (req, res) => {
  const id = req.params.id;

  connection.query("DELETE FROM pkg_offer WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression offre:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    res.json({ message: "Offre supprimée avec succès" });
  });
};
