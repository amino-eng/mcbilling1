const connection = require("../../config/dataBase");

// Afficher tous les DIDs Users
exports.afficher = async (req, res) => {
  try {
    const query = `
      SELECT 
        did_use.id AS id,
        did.did AS DID,
        did_use.id_user AS UserID,
        user.username AS Username,
        did_use.reservationdate AS ReservationDate,
        did_use.releasedate AS ReleaseDate,
        did_use.status AS Status,
        did_use.month_payed AS MonthPayed,
        did_use.reminded AS Reminded,
        did_use.next_due_date AS NextDueDate
      FROM 
        pkg_did_use AS did_use
      LEFT JOIN 
        pkg_user AS user 
        ON did_use.id_user = user.id
      LEFT JOIN 
        pkg_did AS did 
        ON did_use.id_did = did.id
      LIMIT 25;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching DIDs Users data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ didsUsers: results });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Supprimer un DID User par ID
exports.del = (req, res) => {
  const didUseId = req.params.id;
  const query = "DELETE FROM pkg_did_use WHERE id = ?";

  connection.query(query, [didUseId], (err, result) => {
    if (err) {
      console.error("Error deleting DID User record:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "DID User record not found" });
    }

    res.status(200).json({ message: "DID User record deleted successfully" });
  });
};

// Afficher un DID User par ID
exports.getById = async (req, res) => {
  const didUseId = req.params.id;

  try {
    const query = `
      SELECT 
        did_use.id AS id,
        did.did AS DID,
        did_use.id_user AS UserID,
        user.username AS Username,
        did_use.reservationdate AS ReservationDate,
        did_use.releasedate AS ReleaseDate,
        did_use.status AS Status,
        did_use.month_payed AS MonthPayed,
        did_use.reminded AS Reminded,
        did_use.next_due_date AS NextDueDate
      FROM 
        pkg_did_use AS did_use
      LEFT JOIN 
        pkg_user AS user 
        ON did_use.id_user = user.id
      LEFT JOIN 
        pkg_did AS did 
        ON did_use.id_did = did.id
      WHERE 
        did_use.id = ?
    `;

    connection.query(query, [didUseId], (err, result) => {
      if (err) {
        console.error("Error fetching DID User data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "DID User not found" });
      }

      res.json({ didUser: result[0] });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
};

// Ajouter un nouveau DID User
exports.add = (req, res) => {
  const { did, username, reservationDate, releaseDate, status, monthPayed, reminded, nextDueDate } = req.body;

  if (!did || !username || !reservationDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Récupérer l'ID de l'utilisateur depuis le username
  const getUserQuery = "SELECT id FROM pkg_user WHERE username = ?";
  connection.query(getUserQuery, [username], (userErr, userResults) => {
    if (userErr) {
      console.error("Error fetching user ID:", userErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(400).json({ error: "Invalid username" });
    }

    const userId = userResults[0].id;

    // Récupérer l'ID du DID
    const getDidQuery = "SELECT id FROM pkg_did WHERE did = ?";
    connection.query(getDidQuery, [did], (didErr, didResults) => {
      if (didErr) {
        console.error("Error fetching DID ID:", didErr);
        return res.status(500).json({ error: "Database error" });
      }

      if (didResults.length === 0) {
        return res.status(400).json({ error: "Invalid DID" });
      }

      const didId = didResults[0].id;

      // Insérer la nouvelle utilisation du DID
      const insertQuery = `
        INSERT INTO pkg_did_use (id_did, id_user, reservationdate, releasedate, status, month_payed, reminded, next_due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connection.query(
        insertQuery,
        [didId, userId, reservationDate, releaseDate || "0000-00-00 00:00:00", status || 0, monthPayed || 0, reminded || 0, nextDueDate || null],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error adding DID User:", insertErr);
            return res.status(500).json({ error: "Database error" });
          }

          res.status(201).json({
            message: "DID User added successfully",
            id: insertResult.insertId,
          });
        }
      );
    });
  });
};
