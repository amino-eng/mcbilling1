const connection = require("../../config/dataBase");

// Utility function for handling database errors
const handleDatabaseError = (res, error) => {
  console.error("Database error:", error.message);
  return res.status(500).json({ error: "Database error", details: error.message });
};

// Fetch all Queues with user details (id_user = username)
exports.afficherQueues = (req, res) => {
  const query = `
 SELECT 
  q.*,  
  u.id AS user_id,  
  u.username AS username
FROM 
  pkg_queue q
LEFT JOIN 
  pkg_user u
ON 
  q.id_user = u.id;
  `;

  connection.query(query, (err, results) => {
    if (err) return handleDatabaseError(res, err);
    if (results.length === 0) return res.status(404).json({ message: "No Queues found" });
    res.json({ queues: results });
  });
};

// Add a new Queue
exports.ajouterQueue = (req, res) => {
  const { queue_name, id_user } = req.body;

  if (!queue_name || !id_user) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO pkg_queue (queue_name, id_user) 
    VALUES (?, ?)
  `;

  connection.query(query, [queue_name, id_user], (error, results) => {
    if (error) return handleDatabaseError(res, error);
    res.status(201).json({ message: "Queue added successfully", id: results.insertId });
  });
};

// Update an existing Queue
exports.modifierQueue = (req, res) => {
  const queueId = req.params.id;
  const { queue_name, id_user } = req.body;

  if (!queue_name || !id_user) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE pkg_queue 
    SET queue_name = ?, id_user = ? 
    WHERE id = ?
  `;

  connection.query(query, [queue_name, id_user, queueId], (error, results) => {
    if (error) return handleDatabaseError(res, error);
    if (results.affectedRows === 0) return res.status(404).json({ message: "Queue not found" });
    res.status(200).json({ message: "Queue updated successfully" });
  });
};

// Delete a Queue
exports.delQueue = (req, res) => {
  const queueId = req.params.id;

  if (!queueId) {
    return res.status(400).json({ error: "ID is required" });
  }

  const query = "DELETE FROM pkg_queue WHERE id = ?";

  connection.query(query, [queueId], (err, result) => {
    if (err) return handleDatabaseError(res, err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Queue not found" });
    res.status(200).json({ message: "Queue deleted successfully" });
  });
};
