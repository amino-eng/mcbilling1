const express = require("express");
const router = express.Router();
const connection = require("../../config/dataBase");

// Affichage des enregistrements CDR échoués
exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT 
        cdrf.*,   
        u.username, 
        t.trunkcode,
        s.name AS server
      FROM 
        pkg_cdr_failed cdrf
      JOIN 
        pkg_user u ON cdrf.id_user = u.id  
      JOIN 
        pkg_trunk t ON cdrf.id_trunk = t.id  
      JOIN 
        pkg_servers s ON cdrf.id_server = s.id
      ORDER BY 
        cdrf.id_user, cdrf.id_trunk, cdrf.id_server;
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching CDR failed data with joins:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.json({ cdr_failed: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Ajouter un enregistrement CDR échoué
exports.ajouter = (req, res) => {
  console.log("Request Body:", req.body);

  const { date, sip_user, callerID, number, destination, duration, username, buy_price, sell_price, uniqueid, plan, compaign, server } = req.body;

  if (!date || !sip_user || !callerID || !number || !destination || !duration || !username || !buy_price || !sell_price || !uniqueid || !plan || !compaign || !server) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO pkg_cdr_failed (date, sip_user, callerID, number, destination, duration, username, buy_price, sell_price, uniqueid, plan, compaign, server) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [date, sip_user, callerID, number, destination, duration, username, buy_price, sell_price, uniqueid, plan, compaign, server], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "CDR failed record added successfully" });
  });
};

// Supprimer un enregistrement CDR échoué
exports.del = (req, res) => {
  const cdrFailedId = req.params.id;

  if (!cdrFailedId) {
    return res.status(400).json({ error: "ID is required" });
  }

  const query = "DELETE FROM pkg_cdr_failed WHERE id = ?";
  
  connection.query(query, [cdrFailedId], (err, result) => {
    if (err) {
      console.error("Error deleting CDR failed record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "CDR failed record not found" });
    }

    res.status(200).json({ message: "CDR failed record deleted successfully" });
  });
};
