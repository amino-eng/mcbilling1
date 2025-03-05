const connection = require("../../config/dataBase");

// Get all user summaries with username from pkg_user table
exports.getAll = (req, res) => {
    const query = `
        SELECT 
            sc.id, 
            sc.id_user, 
            sc.sessiontime, 
            sc.aloc_all_calls, 
            sc.nbcall, 
            sc.nbcall_fail, 
            sc.buycost, 
            sc.sessionbill, 
            sc.lucro, 
            sc.asr, 
            sc.isAgent, 
            sc.agent_bill, 
            u.username
        FROM 
            pkg_cdr_summary_user sc
        JOIN 
            pkg_user u ON sc.id_user = u.id;
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ data: results });
    });
};

// Get a specific user summary by ID with username from pkg_user table
exports.getById = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            sc.id, 
            sc.id_user, 
            sc.sessiontime, 
            sc.aloc_all_calls, 
            sc.nbcall, 
            sc.nbcall_fail, 
            sc.buycost, 
            sc.sessionbill, 
            sc.lucro, 
            sc.asr, 
            sc.isAgent, 
            sc.agent_bill, 
            u.username
        FROM 
            pkg_cdr_summary_user sc
        JOIN 
            pkg_user u ON sc.id_user = u.id
        WHERE 
            sc.id = ?;
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

// Add a new user summary record
exports.add = (req, res) => {
    const { user_id, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr } = req.body;

    if (!user_id || !month || !sessiontime || !aloc_all_calls || !nbcall || !nbcall_fail || !buycost || !sessionbill || !lucro || !asr) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO pkg_cdr_summary_user 
        (user_id, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    connection.query(query, [user_id, month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr], (err, result) => {
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
    const query = "DELETE FROM pkg_cdr_summary_user WHERE id = ?";

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
