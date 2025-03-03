// ./controller/clients/CallerIdController.js
const connection = require("../../config/dataBase");

// Fonction pour récupérer les informations d'un agent à partir de son id_user
const getAgent = (idUser) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM agents WHERE id = ?";
    connection.query(query, [idUser], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Afficher les informations de pkg_callerid
exports.afficherCallerId = async (req, res) => {
  try {
    const query = `
      SELECT 
        cid, 
        id,
        name, 
        description, 
        id_user,
        activated 
      FROM 
        pkg_callerid
      ORDER BY 
        id DESC
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des informations de pkg_callerid:", err);
        return res.status(500).json({ error: "Erreur de base de données" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Aucune donnée trouvée" });
      }

      res.json({ callerid: results });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).send("Erreur interne du serveur");
  }
};

// Ajouter un enregistrement dans pkg_callerid
exports.ajouterCallerId = (req, res) => {
  const { callerid, username, name, description, status } = req.body;

  if (!callerid || !username || !name || !description || !status) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const query = `
    INSERT INTO pkg_callerid (callerid, username, name, description, status) 
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [callerid, username, name, description, status], (error, results) => {
    if (error) {
      console.error("Erreur de base de données:", error);
      return res.status(500).json({ error: "Erreur de base de données" });
    }
    res.status(201).json({ message: "Enregistrement ajouté avec succès" });
  });
};

// Supprimer un enregistrement de pkg_callerid
exports.supprimerCallerId = (req, res) => {
  const callerId = req.params.id;

  if (!callerId) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = "DELETE FROM pkg_callerid WHERE id = ?";

  connection.query(query, [callerId], (err, result) => {
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

// Afficher les restrictions avec les informations des agents
exports.affiche = async (req, res) => {
  try {
    const query = "SELECT * FROM pkg_restrict_phone";
    
    connection.query(query, async (err, results) => {
      if (err) {
        console.error("Erreur lors de l'exécution de la requête:", err.stack);
        return res.status(500).send("Erreur lors de la récupération des données");
      }

      console.log("Résultats de la requête:", results);

      // Récupération des données des agents pour chaque restriction
      const restrictionsWithAgentData = await Promise.all(results.map(async (restriction) => {
        try {
          const agentData = await getAgent(restriction.id_user);
          return {
            ...restriction, // Inclure toutes les données de restriction
            agent: agentData[0] || null // Prendre le premier élément s'il existe, sinon null
          };
        } catch (error) {
          console.error("Erreur lors de la récupération de l'agent:", error);
          return { ...restriction, agent: null };
        }
      }));

      res.json({ restrictions: restrictionsWithAgentData });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).send("Erreur interne du serveur");
  }
};
