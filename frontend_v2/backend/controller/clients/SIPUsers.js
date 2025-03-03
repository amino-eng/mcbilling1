//controller/clients/SIPUsers.js
const connection = require("../../config/dataBase");




const getAgent = (agentId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM pkg_user WHERE id = ?`; 
      connection.query(query, [agentId], (err, result) => {
        if (err) {
          console.error("Error fetching agent data:", err);
          return reject(err);
        }
        resolve(result); // Resolving the result
      });
    });
  };
// Fetch SIP Users
exports.afficherSIPUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        accountcode, 
        host, 
        status, 
        allow
      FROM 
        pkg_sip
      ORDER BY 
        id DESC
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.json({ sipUsers: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Add SIP User
exports.ajouterSIPUser = (req, res) => {
  const { name, accountcode, host, status, allow } = req.body;

  if (!name || !accountcode || !host || !status || !allow) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO pkg_sip (name, accountcode, host, status, allow) 
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, accountcode, host, status, allow], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Record added successfully" });
  });
};
exports.sipUsers = async (req, res) => {
    try {
      // Query to fetch all users (pkg_user)
      const query = `SELECT * FROM pkg_user`; 
      connection.query(query, async (err, users) => {
        if (err) {
          return res.json(err); // Send error if query fails
        }
  
        // For each user, fetch agent data (you can expand this logic to include more user-related data if needed)
        const usersWithAgentData = await Promise.all(users.map(async (user) => {
          const agentData = await getAgent(user.id); // Fetch agent info for each user
          return {
            ...user,   // Include all user fields
            agent: agentData[0]  // Assuming agentData is an array, take the first element
          };
        }));
  
        // Send the users with their corresponding agent data as the response
        res.json({
          users: usersWithAgentData
        });
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      res.json(err);  // Send error if something goes wrong
    }
  };

// Delete SIP User
exports.supprimerSIPUser = (req, res) => {
  const sipId = req.params.id;

  if (!sipId) {
    return res.status(400).json({ error: "ID is required" });
  }

  const query = "DELETE FROM pkg_sip WHERE id = ?";

  connection.query(query, [sipId], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  });
};

