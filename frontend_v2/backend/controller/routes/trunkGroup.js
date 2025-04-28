const connection = require("../../config/dataBase");

// Get all trunk groups
exports.afficher = (req, res) => {
  const query = "SELECT * FROM pkg_trunk_group";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des trunk groups:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun trunk group trouvé" });
    }

    res.json({ trunk_groups: results });
  });
};

// Add a new trunk group
exports.ajouter = (req, res) => {
  const { name, description } = req.body;
    console.log(req.body);
    
  if (!name) {
    return res.status(400).json({ error: "Le champ 'trunk_group' est requis" });
  }

  const query = `
    INSERT INTO pkg_trunk_group (name, description)
    VALUES (?, ?)
  `;

  connection.query(query, [name, description || null], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du trunk group:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.status(201).json({
      message: "Trunk group ajouté avec succès",
      id: result.insertId
    });
  });
};

// Update a trunk group

exports.modifier = (req, res) => {
    const id = req.params.id; // The id should come from the URL
    const { name, description } = req.body;
  console.log(id);
  
    const query = `
      UPDATE pkg_trunk_group 
      SET name = ?, description = ?
      WHERE id = ?
    `;
  
    connection.query(query, [name, description, id], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du trunk group:", err.message);
        return res.status(500).json({ error: "Erreur de base de données", details: err.message });
      }
  
      if (result.affectedRows === 0) {
        console.log('Trunk group non trouvé');
        
        return res.status(404).json({ message: "Trunk group non trouvé" });
      }
  
      res.json({ message: "Trunk group mis à jour avec succès" });
    });
  };
  

// Delete a trunk group
exports.supprimer = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM pkg_trunk_group WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du trunk group:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trunk group non trouvé" });
    }

    res.json({ message: "Trunk group supprimé avec succès" });
  });
};
