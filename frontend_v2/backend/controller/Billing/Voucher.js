const connection = require('../../config/database');

// Display all vouchers
const afficher = (req, res) => {
    connection.query('SELECT * FROM pkg_voucher', (error, results) => {
        if (error) return res.status(500).json({ error });
        res.json({ vouchers: results });
    });
};

// Display all plans
const afficherPlans = (req, res) => {
    connection.query('SELECT * FROM pkg_plan ORDER BY name ASC', (error, results) => {
        if (error) {
            console.error("Error fetching plans:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No plans found" });
        }
        res.json({ plans: results });
    });
};

// Add a new voucher
const ajouter = (req, res) => {
    const { credit, plan, language, prefix_rules, quantity, description } = req.body;
    connection.query('INSERT INTO pkg_voucher (credit, plan, language, prefix_rules, quantity, description) VALUES (?, ?, ?, ?, ?, ?)', 
    [credit, plan, language, prefix_rules, quantity, description], 
    (error, results) => {
        if (error) return res.status(500).json({ error });
        res.status(201).json({ id: results.insertId });
    });
};

// Delete a voucher
const del = (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM pkg_voucher WHERE id = ?', [id], (error) => {
        if (error) return res.status(500).json({ error });
        res.status(204).send();
    });
};

// Modify a voucher
const modifier = (req, res) => {
    const { id } = req.params;
    const { credit, plan, language, prefix_rules, quantity, description } = req.body;
    connection.query('UPDATE pkg_voucher SET credit = ?, plan = ?, language = ?, prefix_rules = ?, quantity = ?, description = ? WHERE id = ?', 
    [credit, plan, language, prefix_rules, quantity, description, id], 
    (error) => {
        if (error) return res.status(500).json({ error });
        res.status(204).send();
    });
};

module.exports = { afficher, ajouter, del, modifier, afficherPlans };