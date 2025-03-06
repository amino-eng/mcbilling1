const connection = require("../../config/dataBase");

// Afficher tous les enregistrements
exports.afficher = async (req, res) => {
    try {
      const query = `
        SELECT 
          cdr.id, 
          u.username,  -- Retrieve the username instead of id_user
          cdr.day,
          cdr.sessiontime, 
          cdr.nbcall, 
          cdr.nbcall_fail, 
          cdr.buycost, 
          cdr.sessionbill, 
          cdr.lucro, 
          cdr.isAgent, 
          cdr.agent_bill, 
          cdr.asr,
          cdr.aloc_all_calls
        FROM pkg_cdr_summary_day_user cdr
        JOIN pkg_user u ON cdr.id_user = u.id
        LIMIT 25
      `;
  
      connection.query(query, (err, results) => {
        if (err) {
          console.error("Erreur lors de la récupération des données :", err);
          return res.status(500).json({ error: "Erreur de base de données" });
        }
        res.json(results);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      res.status(500).send("Erreur interne du serveur");
    }
  };
// Supprimer un enregistrement
exports.del = (req, res) => {
  const summaryId = req.params.id;
  const query = "DELETE FROM pkg_cdr_summary_day_user WHERE id = ?";

  connection.query(query, [summaryId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression :", err);
      return res.status(500).json({ error: "Erreur de base de données" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enregistrement non trouvé" });
    }

    res.status(200).json({ message: "Enregistrement supprimé avec succès" });
  });
};

// Récupérer un enregistrement par ID
exports.getById = async (req, res) => {
  const summaryId = req.params.id;

  try {
    const query = "SELECT * FROM pkg_cdr_summary_day_user WHERE id = ?";
    connection.query(query, [summaryId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la récupération des données :", err);
        return res.status(500).json({ error: "Erreur de base de données" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Enregistrement non trouvé" });
      }

      res.json(result[0]);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    res.status(500).send("Erreur interne du serveur");
  }
};
