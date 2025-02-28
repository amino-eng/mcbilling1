const connection = require("../../config/dataBase");

// Afficher tous les utilisateurs avec leurs informations associées (groupe, plan, agent, and sip count)
exports.afficherUtilisateurs = (req, res) => {
  const query = `
    SELECT 
  u.*, 
  g.name AS group_name, 
  p.name AS plan_name, 
  cu.username AS agent,
  (SELECT COUNT(*) FROM pkg_sip s WHERE s.id_user = u.id) AS sip_count
FROM pkg_user u
LEFT JOIN pkg_group_user g ON u.id_group = g.id
LEFT JOIN pkg_plan p ON u.id_plan = p.id
LEFT JOIN pkg_user cu ON u.id_user = cu.id  -- Join to get the creator's username

  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json({ users: results });
  });
};
