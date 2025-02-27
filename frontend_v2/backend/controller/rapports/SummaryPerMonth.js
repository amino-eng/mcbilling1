const connection = require("../../config/dataBase");

// Afficher tous les enregistrements pour le mois
exports.getAll = (req, res) => {
    const query = "SELECT * FROM pkg_cdr_summary_month";
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ data: results });
    });
};

// Afficher un enregistrement pour un mois spécifique par ID
exports.getById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM pkg_cdr_summary_month";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.json({ data: result[0] });
    });
};

// Ajouter un enregistrement pour le mois
exports.add = (req, res) => {
    const { month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr } = req.body;

    if (!month || !sessiontime || !aloc_all_calls || !nbcall || !nbcall_fail || !buycost || !sessionbill || !lucro || !asr) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "INSERT INTO pkg_cdr_summary_month (month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    connection.query(query, [month, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr], (err, result) => {
        if (err) {
            console.error("Error adding record:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Record successfully added", id: result.insertId });
    });
};

// Supprimer un enregistrement pour le mois
exports.del = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM pkg_cdr_summary_month WHERE id = ?";

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting record:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.status(200).json({ message: "Record successfully deleted" });
    });
};
