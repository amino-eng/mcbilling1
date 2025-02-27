const connection = require("../../config/dataBase");

// Afficher tous les utilisateurs
exports.afficher = async (req, res) => {
  try {
    const query = "SELECT * FROM pkg_user";
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ users: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Ajouter un utilisateur
exports.ajouter = (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "INSERT INTO pkg_user (username, email, password, role) VALUES (?, ?, ?, ?)";
  connection.query(query, [username, email, password, role], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "User added successfully" });
  });
};

// Supprimer un utilisateur
exports.del = (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM pkg_user WHERE id = ?";

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  });
};

// Afficher un utilisateur par id
exports.getById = async (req, res) => {
  const userId = req.params.id;

  try {
    const query = "SELECT * FROM pkg_user WHERE id = ?";
    connection.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: result[0] });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};
