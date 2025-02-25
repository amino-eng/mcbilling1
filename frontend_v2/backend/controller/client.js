const connection = require("../config/dataBase");


// Affichage de l'agent
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
//username
exports.userRestrict = async (req, res) => {
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

// Affichage des restrictions
exports.affiche = async (req, res) => {
  try {
    // Query to fetch restrictions (you can adjust the limit or remove it as needed)
    const query = 'SELECT * FROM pkg_restrict_phone LIMIT 10'; 
    connection.query(query, async (err, results) => {
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).send('Error querying the database');
      }

      console.log('Query results:', results);

      // Fetch agent information for each restriction (use Promise.all for async calls)
      const restrictionsWithAgentData = await Promise.all(results.map(async (restriction) => {
        const agentData = await getAgent(restriction.id_user); // Fetch agent info for each restriction
        return {
          ...restriction,  // Include all restriction fields
          agent: agentData[0]  // Assuming that the result is an array, take the first element
        };
      }));

      // Sending both restriction data and agent data in the response
      res.json({
        restrictions: restrictionsWithAgentData
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal server error');
  }
};
