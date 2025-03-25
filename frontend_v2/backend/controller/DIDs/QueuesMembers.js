const connection = require("../../config/dataBase");

// Utility function for handling database errors
const handleDatabaseError = (res, error) => {
  console.error("Database error:", error.message);
  return res.status(500).json({ error: "Database error", details: error.message });
};

// Fetch all Queue Members with user details including username
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      qm.*,  
      u.id AS user_id,  
      u.username AS user_username
    FROM 
      pkg_queue_member qm  
    LEFT JOIN 
      pkg_user u  
    ON 
      qm.id_user = u.id; 
  `;

  connection.query(query, (err, results) => {
    if (err) return handleDatabaseError(res, err);
    if (results.length === 0) return res.status(404).json({ message: "No Queue Members found" });
    res.json({ queueMembers: results });
  });
};

// Add a new Queue Member
// Add a new Queue Member
exports.ajouter = (req, res) => {
  const { queue, paused, sipUser } = req.body;

  if (!queue || !paused || !sipUser) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // First, retrieve the id_user and name of the selected queue from the pkg_queue table
  const queryQueue = 'SELECT id_user, name FROM pkg_queue WHERE id = ?'; // Fetch id_user and name
  
  connection.query(queryQueue, [queue], (error, results) => {
    if (error) return handleDatabaseError(res, error);
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Queue not found" });
    }
    
    const id_user = results[0].id_user;
    const queueName = results[0].name; // Get the name of the queue
    
    // Now, check if the selected SIP user matches the id_user of the queue
    const querySIPUser = 'SELECT * FROM pkg_sip WHERE id_user = ? AND id = ?';
    
    connection.query(querySIPUser, [id_user, sipUser], (error, sipResults) => {
      if (error) return handleDatabaseError(res, error);
      
      if (sipResults.length === 0) {
        return res.status(404).json({ error: "SIP User not found for the selected Queue's id_user" });
      }

      // Proceed with adding the new queue member
      const queryInsert = `
        INSERT INTO pkg_queue_member (queue_name, interface, paused, id_user) 
        VALUES (?, ?, ?, ?)
      `;
      
      connection.query(queryInsert, [queueName, `SIP/${sipResults[0].name}`, paused, id_user], (error, results) => {
        if (error) return handleDatabaseError(res, error);
        res.status(201).json({ message: "Queue Member added successfully", id: results.insertId });
      });
    });
  });
};





// Update a Queue Member
exports.modifier = (req, res) => {
  const memberId = req.params.id;
  const { queue_name, member_name, id_user } = req.body;

  if (!queue_name || !member_name || !id_user) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE pkg_queue_member 
    SET queue_name = ?, member_name = ?, id_user = ? 
    WHERE id = ?
  `;

  connection.query(query, [queue_name, member_name, id_user, memberId], (error, results) => {
    if (error) return handleDatabaseError(res, error);
    if (results.affectedRows === 0) return res.status(404).json({ message: "Queue Member not found" });
    res.status(200).json({ message: "Queue Member updated successfully" });
  });
};

// Delete a Queue Member
exports.del = (req, res) => {
  const memberId = req.params.id;

  if (!memberId) {
    return res.status(400).json({ error: "ID is required" });
  }

  const query = "DELETE FROM pkg_queue_member WHERE id = ?";

  connection.query(query, [memberId], (err, result) => {
    if (err) return handleDatabaseError(res, err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Queue Member not found" });
    res.status(200).json({ message: "Queue Member deleted successfully" });
  });
};