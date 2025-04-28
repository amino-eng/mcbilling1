const connection = require("../../config/dataBase");

// Get all plans
exports.afficher = (req, res) => {
  const query = "SELECT * FROM pkg_plan";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des plans:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun plan trouvé" });
    }

    res.json({ plans: results });
  });
};

// Add a new plan
exports.ajouter = (req, res) => {
  const { name, techprefix } = req.body;
  console.log(req.body);
  

  const query = `
    INSERT INTO pkg_plan 
    (name, techprefix)
    VALUES (?, ?)
  `;

  const values = [ name, techprefix ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du plan:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.status(201).json({
      message: "Plan ajouté avec succès",
      id: result.insertId
    });
  });
};

// Update a plan
exports.modifier = (req, res) => {
    const { name, techprefix, creationdate, plan_type } = req.body;
    console.log(req.body);
    
    const id = req.params.id;
  
    const sql = `UPDATE pkg_plan SET name = ?, techprefix = ? WHERE id = ?`;
    const params = [name, techprefix, id];
  
    connection.query(sql, params, (err, result) => {
      if (err) {
        console.error("Erreur modification plan:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Plan modifié avec succès" });
    });
  };
  
  

// Delete a plan
exports.supprimer = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM pkg_plan WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du plan:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    res.json({ message: "Plan supprimé avec succès" });
  });
};
