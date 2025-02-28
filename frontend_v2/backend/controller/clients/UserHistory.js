const express = require("express");
const router = express.Router();
const connection = require("../../config/dataBase");

// Affichage de l'historique des utilisateurs avec jointure sur pkg_user
exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT 
        uh.*,   
        u.username
      FROM 
        pkg_user_history uh
      JOIN 
        pkg_user u ON uh.id_user = u.id
      ORDER BY 
        uh.date DESC;
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'historique des utilisateurs:", err);
        return res.status(500).json({ error: "Erreur de base de données" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Aucune donnée trouvée" });
      }

      res.json({ user_history: results });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).send("Erreur interne du serveur");
  }
};

// Ajouter un enregistrement dans l'historique des utilisateurs
exports.ajouter = (req, res) => {
  console.log("Request Body:", req.body);

  const { id_user, action } = req.body;

  if (!id_user || !action) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const query = `
    INSERT INTO pkg_user_history (id_user, action) 
    VALUES (?, ?)
  `;

  connection.query(query, [id_user, action], (error, results) => {
    if (error) {
      console.error("Erreur de base de données:", error);
      return res.status(500).json({ error: "Erreur de base de données" });
    }
    res.status(201).json({ message: "Enregistrement ajouté avec succès" });
  });
};

// Supprimer un enregistrement de l'historique des utilisateurs
exports.del = (req, res) => {
  const historyId = req.params.id;

  if (!historyId) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = "DELETE FROM pkg_user_history WHERE id = ?";
  
  connection.query(query, [historyId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'enregistrement:", err);
      return res.status(500).json({ error: "Erreur de base de données" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enregistrement non trouvé" });
    }

    res.status(200).json({ message: "Enregistrement supprimé avec succès" });
  });
};