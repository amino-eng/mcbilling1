const connection = require("../../config/dataBase");

// GET - afficher tous les rate providers avec jointures
exports.afficher = (req, res) => {
  const query = `
   SELECT 
  r.id,
  p.prefix           AS prefix,
  p.destination      AS destination,
  pr.provider_name   AS provider,
  r.buyrate,
  r.buyrateinitblock,
  r.buyrateincrement,
  r.minimal_time_buy,
  r.dialprefix
FROM pkg_rate_provider r
JOIN pkg_prefix  p  ON r.id_prefix   = p.id
JOIN pkg_provider pr ON r.id_provider = pr.id;

  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des taux fournisseurs:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.json({ rates: results });
  });
};

// POST - ajouter un nouveau rate provider
exports.ajouter = (req, res) => {
  const {
    id_prefix,
    id_provider,
    buyrate,
    buyrateinitblock,
    buyrateincrement,
    minimal_time_buy,
    dialprefix,
    destination
  } = req.body;

  const query = `
    INSERT INTO pkg_rate_provider (
      id_prefix,
      id_provider,
      buyrate,
      buyrateinitblock,
      buyrateincrement,
      minimal_time_buy,
      dialprefix,
      destination
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id_prefix,
    id_provider,
    buyrate,
    buyrateinitblock,
    buyrateincrement,
    minimal_time_buy,
    dialprefix,
    destination
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du rate provider:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.status(201).json({ message: "Taux fournisseur ajouté", id: result.insertId });
  });
};

// PUT - modifier un rate provider
exports.modifier = (req, res) => {
  const { id } = req.params;
  const {
    id_prefix,
    id_provider,
    buyrate,
    buyrateinitblock,
    buyrateincrement,
    minimal_time_buy,
    dialprefix,
    destination
  } = req.body;

  const query = `
    UPDATE pkg_rate_provider SET
      id_prefix = ?,
      id_provider = ?,
      buyrate = ?,
      buyrateinitblock = ?,
      buyrateincrement = ?,
      minimal_time_buy = ?,
      dialprefix = ?,
      destination = ?
    WHERE id = ?
  `;

  const values = [
    id_prefix,
    id_provider,
    buyrate,
    buyrateinitblock,
    buyrateincrement,
    minimal_time_buy,
    dialprefix,
    destination,
    id
  ];

  connection.query(query, values, (err) => {
    if (err) {
      console.error("Erreur lors de la modification du rate provider:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.json({ message: "Taux fournisseur modifié avec succès" });
  });
};

// DELETE - supprimer un rate provider
exports.supprimer = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM pkg_rate_provider WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Taux non trouvé" });
    }

    res.json({ message: "Taux fournisseur supprimé avec succès" });
  });
};
