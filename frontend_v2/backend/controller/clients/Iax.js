const connection = require("../../config/dataBase");

// Afficher les informations de pkg_iax

const getAgent = (agentId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM pkg_user WHERE id = ?`; 
      connection.query(query, [agentId], (err, result) => {
        if (err) {
          console.error("Error fetching agent data:", err);
          return reject(err);
        }
        resolve(result); // Resolving the result
      });
    });
  }
exports.afficherIax = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.name,
        u.username AS user_name, 
        i.secret, 
        i.host, 
        i.port,
        i.context,
        i.callerid,
        i.allow,
        i.nat,
        i.qualify,
        i.dtmfmode,
        i.insecure,
        i.type
      FROM 
        pkg_iax i
      INNER JOIN 
        pkg_user u 
      ON 
        i.id_user = u.id
      ORDER BY 
        i.id_user DESC;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des informations de pkg_iax:", err);
        return res.status(500).json({ error: "Erreur de base de données" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Aucune donnée trouvée" });
      }

      res.json({ iax: results });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).send("Erreur interne du serveur");
  }
};

// Ajouter un enregistrement dans pkg_iax
exports.ajouterIax = (req, res) => {
  const { id_user, secret, host, port, context, callerid, allow, nat, qualify, dtmfmode, insecure, type } = req.body;

  if (!id_user || !secret || !host || !port || !context || !callerid || !allow || !nat || !qualify || !dtmfmode || !insecure || !type) {
    console.log("error if ");
    
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    
  }

  const query = `
    INSERT INTO pkg_iax (id_user, secret, host, port, context, callerid, allow, nat, qualify, dtmfmode, insecure, type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [id_user, secret, host, port, context, callerid, allow, nat, qualify, dtmfmode, insecure, type], (error, results) => {
    if (error) {
      console.error("Erreur de base de données:", error);
      return res.status(500).json({ error: "Erreur de base de données" });
    }
    res.status(201).json({ message: "Enregistrement ajouté avec succès" });
  });
};

exports.UsersIax = async (req, res) => {
    try {
      // Query to fetch all users (pkg_user)
      const query = `SELECT * FROM pkg_user`; 
      connection.query(query, async (err, users) => {
        if (err) {
          return res.json(err); // Send error if query fails
        }
  
        // For each user, fetch agent data (you can expand this logic to include more user-related data if needed)
        const usersWithAgentData = await Promise.all(users.map(async (user) => {
          const agentData = await getAgent(user.id); // Fetch agent info for each user
          return {
            ...user,   // Include all user fields
            agent: agentData[0]  // Assuming agentData is an array, take the first element
          };
        }));
  
        // Send the users with their corresponding agent data as the response
        res.json({
          users: usersWithAgentData
        });
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      res.json(err);  // Send error if something goes wrong
    }
  };

// Supprimer un enregistrement de pkg_iax
exports.supprimerIax = (req, res) => {
  const iaxId = req.params.id;

  if (!iaxId) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = "DELETE FROM pkg_iax WHERE id = ?";

  connection.query(query, [iaxId], (err, result) => {
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
