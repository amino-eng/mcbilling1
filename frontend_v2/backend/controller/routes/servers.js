const connection = require("../../config/dataBase");

// Get all servers
exports.afficher = (req, res) => {
  const query = "SELECT * FROM pkg_servers";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des serveurs:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun serveur trouvé" });
    }

    res.json({ servers: results });
  });
};

// Add a new server
exports.ajouter = (req, res) => {
    const {
      name, host, public_ip, username, password,
      port, sip_port, type, status, description
    } = req.body;
  
    const query = `
      INSERT INTO pkg_servers 
      (name, host, public_ip, username, password, port, sip_port, type, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      name, host, public_ip, username, password,
      port, sip_port, type, status, description
    ];
  
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du serveur:", err.message);
        return res.status(500).json({ error: "Erreur de base de données", details: err.message });
      }
  
      res.status(201).json({
        message: "Serveur ajouté avec succès",
        id: result.insertId
      });
    });
  };
  

// Update a server
exports.modifier = (req, res) => {
  console.log("Request body:", req.body);
  
  // Extract the ID from the URL params, not the body
  const id = req.params.id;
  
  const {
    name, host, public_ip, username, password,
    port, sip_port, type, status, description
  } = req.body;

  // Log the status specifically to debug
  console.log("Status value being sent to database:", status, "Type:", typeof status);
  
  // Ensure status is properly formatted for the database
  // MySQL expects 0 or 1 for TINYINT fields used as boolean
  const formattedStatus = status == 1 ? 1 : 0;
  
  const query = `
    UPDATE pkg_servers SET
      name = ?,
      host = ?,
      public_ip = ?,
      username = ?,
      password = ?,
      port = ?,
      sip_port = ?,
      type = ?,
      status = ?,
      description = ?
    WHERE id = ?
  `;

  const values = [
    name, host, public_ip, username, password,
    port, sip_port, type, formattedStatus, description,
    id
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la modification du serveur:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }
    
    console.log("Update result:", result);
    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serveur non trouvé ou aucune modification effectuée" });
    }
    
    res.status(200).json({ 
      message: "Serveur modifié avec succès",
      status: formattedStatus // Return the status that was actually saved
    });
  });
};


// Delete a server
exports.supprimer = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM pkg_servers WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du serveur:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }

    res.json({ message: "Serveur supprimé avec succès" });
  });
};
