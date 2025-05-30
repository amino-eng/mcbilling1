const connection = require("../../config/dataBase");

// Afficher tous les enregistrements de refill
exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT 
        refill.*, 
        user.username 
      FROM 
        pkg_refill AS refill 
      LEFT JOIN 
        pkg_user AS user 
      ON 
        refill.id_user = user.id
      ORDER BY refill.date DESC
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching Refill data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ refills: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Supprimer un enregistrement de refill
exports.del = (req, res) => {
  const refillId = req.params.id;
  const query = "DELETE FROM pkg_refill WHERE id = ?";

  connection.query(query, [refillId], (err, result) => {
    if (err) {
      console.error("Error deleting Refill record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Refill record not found" });
    }

    res.status(200).json({ message: "Refill record deleted successfully" });
  });
};

// Afficher un refill par id avec le username
exports.getById = async (req, res) => {
  const refillId = req.params.id;

  try {
    const query = `
      SELECT 
        refill.*, 
        user.username 
      FROM 
        pkg_refill AS refill 
      LEFT JOIN 
        pkg_user AS user 
      ON 
        refill.id_user = user.id_user 
      WHERE 
        refill.id = ?
    `;

    connection.query(query, [refillId], (err, result) => {
      if (err) {
        console.error("Error fetching Refill data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Refill not found" });
      }

      res.json({ refill: result[0] });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// add a reffil 
exports.add = (req, res) => {
  const { id_user, credit, description, payment } = req.body;

  // Validate required fields
  if (!id_user || isNaN(id_user)) {
    return res.status(400).json({ error: "Valid user ID is required" });
  }

  if (!credit || isNaN(credit)) {
    return res.status(400).json({ error: "Valid credit amount is required" });
  }

  const query = "INSERT INTO pkg_refill SET ?";

  connection.query(query, { 
    id_user: parseInt(id_user),
    credit: parseFloat(credit),
    description,
    payment: payment === 'true' || payment === true
  }, (err, result) => {
    if (err) {
      console.error("Error inserting Refill record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({ message: "Refill record created successfully", id: result.insertId });
  });
};

// Update a refill record
exports.update = (req, res) => {
  const refillId = req.params.id;
  const { id_user, credit, description, payment } = req.body;
  
  // Validate required fields
  if (!id_user || isNaN(id_user)) {
    return res.status(400).json({ error: "Valid user ID is required" });
  }
  
  if (!credit || isNaN(credit)) {
    return res.status(400).json({ error: "Valid credit amount is required" });
  }

  const query = "UPDATE pkg_refill SET ? WHERE id = ?";

  connection.query(query, [
    { 
      id_user: parseInt(id_user),
      credit: parseFloat(credit),
      description,
      payment: payment === 'true' || payment === true
    },
    refillId
  ], (err, result) => {
    if (err) {
      console.error("Error updating Refill record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Refill record not found" });
    }

    res.status(200).json({ message: "Refill record updated successfully" });
  });
};