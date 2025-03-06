const connection = require("../../config/dataBase");

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
