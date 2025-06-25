const connection = require("../../config/dataBase");

// Get user call statistics
exports.getUserCallStats = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (startDate && endDate) {
      whereClause = 'WHERE cdr.day BETWEEN ? AND ? ';
      params.push(startDate, endDate);
    }
    
    const query = `
      SELECT 
        u.username,
        COALESCE(SUM(cdr.nbcall), 0) as total_calls,
        COALESCE(SUM(cdr.nbcall - cdr.nbcall_fail), 0) as answered_calls,
        COALESCE(SUM(cdr.nbcall_fail), 0) as failed_calls,
        COALESCE(SUM(cdr.sessiontime), 0) as total_duration,
        COALESCE(SUM(cdr.sessionbill), 0) as sell_price,
        COALESCE(SUM(cdr.buycost), 0) as buy_price,
        COALESCE(SUM(cdr.lucro), 0) as revenue
      FROM pkg_user u
      LEFT JOIN pkg_cdr_summary_day_user cdr ON u.id = cdr.id_user
      ${whereClause}
      GROUP BY u.id, u.username
      ORDER BY revenue DESC
      LIMIT 5  -- Top 5 users by revenue
    `;
    
    console.log('Executing query with params:', { query, params });

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching user call stats:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error in getUserCallStats:", error);
    res.status(500).send("Internal server error");
  }
};

// Afficher les enregistrements avec filtrage par plage de dates
exports.afficher = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let query = `
        SELECT 
          cdr.id, 
          u.username,
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
      `;

      const queryParams = [];
      
      // Add date range filter if provided
      if (startDate && endDate) {
        query += ' WHERE cdr.day BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
      }

      query += ' ORDER BY cdr.day DESC';
      
      // Remove the LIMIT to get all matching records
      // The frontend will handle pagination

      connection.query(query, queryParams, (err, results) => {
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
