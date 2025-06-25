const connection = require("../../config/dataBase");

// Get monthly user call statistics
exports.getUserMonthlyStats = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = 'WHERE smu.month IS NOT NULL ';
    const params = [];
    
    if (startDate && endDate) {
      whereClause += 'AND smu.month BETWEEN ? AND ? ';
      params.push(
        startDate.substring(0, 7), // Format YYYY-MM
        endDate.substring(0, 7)    // Format YYYY-MM
      );
    }
    
    const query = `
      SELECT 
        u.username,
        COALESCE(SUM(smu.nbcall), 0) as total_calls,
        COALESCE(SUM(smu.nbcall - smu.nbcall_fail), 0) as answered_calls,
        COALESCE(SUM(smu.nbcall_fail), 0) as failed_calls,
        COALESCE(SUM(smu.sessiontime), 0) as total_duration,
        COALESCE(SUM(smu.sessionbill), 0) as sell_price,
        COALESCE(SUM(smu.buycost), 0) as buy_price,
        COALESCE(SUM(smu.lucro), 0) as revenue,
        smu.month
      FROM pkg_user u
      LEFT JOIN pkg_cdr_summary_month_user smu ON u.id = smu.id_user
      ${whereClause}
      GROUP BY u.id, u.username, smu.month
      ORDER BY smu.month DESC, revenue DESC
      LIMIT 5  -- Top 5 users by revenue per month
    `;
    
    console.log('Executing monthly query with params:', { query, params });
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching monthly user stats:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      // Format month as YYYY-MM for better display
      const formattedResults = results.map(item => ({
        ...item,
        month: item.month ? `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}` : 'N/A'
      }));
      
      res.json(formattedResults);
    });
  } catch (error) {
    console.error("Error in getUserMonthlyStats:", error);
    res.status(500).send("Internal server error");
  }
};

// Get all user summaries for the month with username
exports.getAll = (req, res) => {
    const query = `
        SELECT 
            smu.id, 
            smu.id_user, 
            smu.month, 
            smu.sessiontime, 
            smu.aloc_all_calls, 
            smu.nbcall, 
            smu.nbcall_fail, 
            smu.buycost, 
            smu.sessionbill, 
            smu.lucro, 
            smu.asr, 
            u.username
        FROM 
            pkg_cdr_summary_month_user smu
        JOIN 
            pkg_user u ON smu.id_user = u.id;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ data: results });
    });
};

// Get a specific user summary by ID
exports.getById = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            smu.id, 
            smu.id_user, 
            smu.month, 
            smu.sessiontime, 
            smu.aloc_all_calls, 
            smu.nbcall, 
            smu.nbcall_fail, 
            smu.buycost, 
            smu.sessionbill, 
            smu.lucro, 
            smu.asr, 
            u.username
        FROM 
            pkg_cdr_summary_month_user smu
        JOIN 
            pkg_user u ON smu.id_user = u.id
        WHERE 
            smu.id = ?;
    `;

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching data:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.json({ data: result[0] });
    });
};

// Add a new user summary record for a month
exports.add = (req, res) => {
    const { id_user, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr } = req.body;

    if (!id_user || !month || !sessiontime || !aloc_all_calls || !nbcall || !nbcall_fail || !buycost || !sessionbill || !lucro || !asr) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO pkg_cdr_summary_month_user 
        (id_user, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    connection.query(query, [id_user, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr], (err, result) => {
        if (err) {
            console.error("Error adding record:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Record successfully added", id: result.insertId });
    });
};

// Delete a user summary record by ID
exports.del = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM pkg_cdr_summary_month_user WHERE id = ?";

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting record:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.status(200).json({ message: "Record successfully deleted" });
    });
};
