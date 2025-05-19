const connection = require("../../config/dataBase");

const handleDatabaseError = (res, error) => {
  console.error("Database error:", error.message);
  return res.status(500).json({ error: "Database error", details: error.message });
};

exports.getQueues = (req, res) => {
  const query = 'SELECT id, name, id_user FROM pkg_queue ORDER BY name ASC';
  connection.query(query, (err, results) => {
    if (err) return handleDatabaseError(res, err);
    console.log('Available queues:', results);
    res.json({ queues: results });
  });
};

exports.getSIPUsers = (req, res) => {
  const query = 'SELECT id, name, accountcode, id_user FROM pkg_sip ORDER BY name ASC';
  connection.query(query, (err, results) => {
    if (err) return handleDatabaseError(res, err);
    console.log('Available SIP users:', results);
    res.json({ users: results });
  });
};

exports.afficher = (req, res) => {
  const query = `
    SELECT qm.*, u.username AS user_username
    FROM pkg_queue_member qm
    LEFT JOIN pkg_user u ON qm.id_user = u.id
    ORDER BY u.username ASC
  `;

  connection.query(query, (err, results) => {
    if (err) return handleDatabaseError(res, err);
    if (results.length === 0) return res.status(404).json({ message: "No Queue Members found" });
    res.json({ queueMembers: results });
  });
};

exports.ajouter = (req, res) => {
  const { queue, paused, sipUser } = req.body;
  
  console.log('Adding queue member with data:', { queue, paused, sipUser });

  if (!queue || paused === undefined || !sipUser) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: "All fields are required" });
  }

  const queryQueue = 'SELECT id_user, name FROM pkg_queue WHERE id = ?';
  console.log('Executing query:', queryQueue, 'with params:', [queue]);
  
  connection.query(queryQueue, [queue], (error, results) => {
    if (error) {
      console.error('Database error when finding queue:', error);
      return handleDatabaseError(res, error);
    }
    
    console.log('Queue query results:', results);
    
    if (results.length === 0) {
      console.log('Queue not found with ID:', queue);
      return res.status(404).json({ error: "Queue not found" });
    }

    const id_user = results[0].id_user;
    const queueName = results[0].name;
    
    console.log('Queue found:', { id_user, queueName });

    const querySIPUser = 'SELECT * FROM pkg_sip WHERE id = ?';
    console.log('Executing SIP user query:', querySIPUser, 'with params:', [sipUser]);
    
    connection.query(querySIPUser, [sipUser], (error, sipResults) => {
      if (error) {
        console.error('Database error when finding SIP user:', error);
        return handleDatabaseError(res, error);
      }
      
      console.log('SIP user query results:', sipResults);
      
      if (sipResults.length === 0) {
        console.log('SIP user not found with id:', sipUser);
        return res.status(404).json({ error: `SIP User with ID ${sipUser} not found` });
      }

      const queryInsert = `
        INSERT INTO pkg_queue_member (queue_name, interface, paused, id_user) 
        VALUES (?, ?, ?, ?)
      `;
      const insertParams = [queueName, `SIP/${sipResults[0].name}`, paused, id_user];
      console.log('Executing insert query:', queryInsert, 'with params:', insertParams);
      
      connection.query(queryInsert, insertParams, (error, results) => {
        if (error) {
          console.error('Database error when inserting queue member:', error);
          return handleDatabaseError(res, error);
        }
        
        console.log('Queue member inserted successfully:', results);
        res.status(201).json({ message: "Queue Member added successfully", id: results.insertId });
      });
    });
  });
};

exports.modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [result] = await connection.promise().query(
      'UPDATE pkg_queue_member SET ? WHERE id = ?',
      [updateData, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Queue member not found' });
    }

    res.json({ message: 'Update successful' });
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

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

module.exports = {
  handleDatabaseError,
  getQueues: exports.getQueues,
  getSIPUsers: exports.getSIPUsers,
  afficher: exports.afficher,
  ajouter: exports.ajouter,
  modifier: exports.modifier,
  del: exports.del
};