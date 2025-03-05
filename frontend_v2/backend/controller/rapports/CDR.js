const express = require("express");
const router = express.Router();
const connection = require("../../config/dataBase");

// Affichage des enregistrements CDR

exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT
    cdr.*, 
    user.username, 
    trunk.trunkcode, 
    server.name AS server_name 
FROM 
    pkg_cdr AS cdr 
LEFT JOIN 
    pkg_user AS user 
    ON cdr.id_user = user.id_user 
LEFT JOIN 
    pkg_trunk AS trunk 
    ON cdr.id_trunk = trunk.id 
LEFT JOIN 
    pkg_servers AS server 
    ON cdr.id_server = server.id
      

    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching CDR data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ cdr: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// // Supprimer un enregistrement CDR
exports.del= (req, res) => {
  const cdrId = req.params.id;
  const query = "DELETE FROM pkg_cdr WHERE id = ?";

  connection.query(query, [cdrId], (err, result) => {
    if (err) {
      console.error("Error deleting CDR record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "CDR record not found" });
    }

    res.status(200).json({ message: "CDR record deleted successfully" });
  });
};
//qfficher un utilisateur par id 

    // // Afficher un utilisateur par id
exports.getById = async (req, res) => {
  const userId = req.params.id;

  try {
    const query = "SELECT * FROM pkg_cdr WHERE id = ?";
    connection.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: result[0] });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};