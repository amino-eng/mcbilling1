const express = require("express");
const router = express.Router();
const connection = require("../../config/dataBase");

// Affichage des enregistrements CDR Archive
exports.afficher = async (req, res) => {
    try {
      const query = `
     SELECT 
   cdr_archive.id, 
   cdr_archive.starttime AS Call_date,  
   cdr_archive.sessiontime AS duration,  
   cdr_archive.real_sessiontime AS real_duration,  
   cdr_archive.terminatecauseid AS status,  
   user.username, 
   trunk.trunkcode,  
   cdr_archive.sipiax AS destination,
   cdr_archive.calledstation AS number,
   cdr_archive.src AS sip_user,
   cdr_archive.buycost AS buy_price,
   cdr_archive.sessionbill AS sell_price,
   cdr_archive.uniqueid AS unique_id  
FROM 
   pkg_cdr_archive AS cdr_archive 
LEFT JOIN 
   pkg_user AS user 
   ON cdr_archive.id_user = user.id 
LEFT JOIN 
   pkg_trunk AS trunk 
   ON cdr_archive.id_trunk = trunk.id  -- Make sure to join on the correct column
LIMIT 0, 25;

      `;
  
      connection.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching CDR Archive data:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ cdr_archive: results });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal server error");
    }
  };
// Supprimer un enregistrement CDR Archive
exports.del = (req, res) => {
  const cdrArchiveId = req.params.id;
  const query = "DELETE FROM pkg_cdr_archive WHERE id = ?";

  connection.query(query, [cdrArchiveId], (err, result) => {
    if (err) {
      console.error("Error deleting CDR Archive record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "CDR Archive record not found" });
    }

    res.status(200).json({ message: "CDR Archive record deleted successfully" });
  });
};

// Afficher un enregistrement CDR Archive par id
exports.getById = async (req, res) => {
  const cdrArchiveId = req.params.id;

  try {
    const query = "SELECT * FROM pkg_cdr_archive WHERE id = ?";
    connection.query(query, [cdrArchiveId], (err, result) => {
      if (err) {
        console.error("Error fetching CDR Archive data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "CDR Archive record not found" });
      }

      res.json({ cdr_archive: result[0] });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};