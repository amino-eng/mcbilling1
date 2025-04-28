const connection = require("../../config/dataBase");

// Get all tariffs with joins
exports.afficher = (req, res) => {
    const query = `
    SELECT 
      r.*, 
      p.name AS plan, 
      pr.destination AS destination, 
      pr.prefix AS prefix,
      tg.name AS trunk_group_name, 
      tg.description AS trunk_group_description
    FROM pkg_rate AS r
    LEFT JOIN pkg_plan AS p ON r.id_plan = p.id
    LEFT JOIN pkg_prefix AS pr ON r.id_prefix = pr.id
    LEFT JOIN pkg_trunk_group AS tg ON r.id_trunk_group = tg.id
  `;
  
  
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tarifs:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun tarif trouvé" });
    }

    res.json({ tarifs: results });
  });
};

// Ajouter un nouveau tarif
// Ajouter un nouveau tarif
exports.ajouter = (req, res) => {
    const { id_plan, id_prefix, id_trunk_group, margin } = req.body;
    console.log(req.body);

    if (!id_plan || !id_prefix || !id_trunk_group) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // Correction ici : 4 valeurs seulement
    const query = `
      INSERT INTO pkg_rate (id_plan, id_prefix, id_trunk_group)
      VALUES (?, ?, ?)
    `;

    const values = [id_plan, id_prefix, id_trunk_group];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du tarif:", err.message);
        return res.status(500).json({ error: "Erreur base de données", details: err.message });
      }

      res.status(201).json({ message: "Tarif ajouté avec succès", id: result.insertId });
    });
};

// Modifier un tarif
exports.modifier = (req, res) => {
  const id = req.params.id;
  const { id_plan, id_prefix, id_trunk_group } = req.body;

  const query = `
    UPDATE pkg_rate 
    SET id_plan = ?, id_prefix = ?, id_trunk_group = ?
    WHERE id = ?
  `;

  const values = [id_plan, id_prefix, id_trunk_group,  id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur modification tarif:", err.message);
      return res.status(500).json({ error: "Erreur serveur", details: err.message });
    }

    res.json({ message: "Tarif modifié avec succès" });
  });
};

// Supprimer un tarif
exports.supprimer = (req, res) => {
  const id = req.params.id;

  connection.query("DELETE FROM pkg_rate WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression tarif:", err.message);
      return res.status(500).json({ error: "Erreur base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarif non trouvé" });
    }

    res.json({ message: "Tarif supprimé avec succès" });
  });
};
