const connection = require("../../config/dataBase");

// Afficher tous les IVRs avec le username de l'utilisateur associé
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      ivr.id, 
      user.username, 
      ivr.name, 
      ivr.monFriStart, 
      ivr.satStart, 
      ivr.sunStart 
    FROM pkg_ivr ivr
    JOIN pkg_user user ON ivr.id_user = user.id
    ;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching IVRs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ ivrs: results });
  });
};

// Afficher un IVR par ID
exports.getById = (req, res) => {
  const ivrId = req.params.id;
  const query = `
    SELECT 
      ivr.id, 
      user.username, 
      ivr.name, 
      ivr.monFriStart, 
      ivr.satStart, 
    FROM pkg_ivr ivr
    JOIN pkg_user user ON ivr.id_user = user.id
    WHERE ivr.id = ?;
  `;

  connection.query(query, [ivrId], (err, result) => {
    if (err) {
      console.error("Error fetching IVR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "IVR not found" });
    }

    res.json({ ivr: result[0] });
  });
};

// Ajouter un IVR
exports.add = (req, res) => {
    // Extract required fields from the request body
    const { id_user, name } = req.body;
  
    // Check if required fields are present
    if (!id_user || !name) {
      return res.status(400).json({ error: "Missing required fields: id_user and name are required" });
    }
  
    // Define the SQL query to insert data into the pkg_ivr table
    const query = `
      INSERT INTO pkg_ivr (id_user, name) 
      VALUES (?, ?);
    `;
  
    // Execute the query with the required fields
    connection.query(query, [id_user, name], (err, result) => {
      if (err) {
        console.error("Error adding IVR:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      // Return success response with the ID of the newly inserted record
      res.status(201).json({ message: "IVR added successfully", id: result.insertId });
    });
  };

// Supprimer un IVR par ID
exports.del = (req, res) => {
  const ivrId = req.params.id;
  const query = "DELETE FROM pkg_ivr WHERE id = ?;";

  connection.query(query, [ivrId], (err, result) => {
    if (err) {
      console.error("Error deleting IVR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "IVR not found" });
    }

    res.status(200).json({ message: "IVR deleted successfully" });
  });
};
