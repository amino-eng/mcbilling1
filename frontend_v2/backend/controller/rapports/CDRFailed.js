const express = require("express");
const router = express.Router();
const connection = require("../../config/dataBase");

// Affichage des enregistrements CDR échoués
exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT 
        cdrf.*,
        IFNULL(u.username, 'N/A') AS username, 
        IFNULL(t.trunkcode, '') AS trunkcode,
        IFNULL(s.name, 'N/A') AS server
      FROM 
        pkg_cdr_failed cdrf
      LEFT JOIN 
        pkg_user u ON cdrf.id_user = u.id  
      LEFT JOIN 
        pkg_trunk t ON cdrf.id_trunk = t.id  
      LEFT JOIN 
        pkg_servers s ON cdrf.id_server = s.id
      ORDER BY 
        cdrf.id_user, cdrf.id_trunk, cdrf.id_server;
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching CDR failed data:", err);
        return res.status(500).json({ 
          error: "Database error",
          details: err.message 
        });
      }
      
      res.json({ 
        success: true,
        count: results.length,
        cdr_failed: results 
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
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