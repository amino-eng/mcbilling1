const connection = require('../../config/database');

// Display all vouchers
const afficher = (req, res) => {
    connection.query('SELECT * FROM pkg_voucher ORDER BY creationdate DESC', (error, results) => {
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
    console.log('Adding voucher with data:', req.body);
    
    if (!credit || !plan || !quantity) {
        console.error('Missing required fields');
        return res.status(400).json({ 
            error: 'Missing required fields',
            details: { 
                received: req.body,
                required: ['credit', 'plan', 'quantity']
            }
        });
    }
    
    const sql = 'INSERT INTO pkg_voucher (credit, plan_id, language, prefix_rules, quantity, description) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [credit, plan, language, prefix_rules, quantity, description];
    
    console.log('Executing SQL:', sql, 'with values:', values);
    
    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database error details:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                sql: error.sql
            });
            return res.status(500).json({ 
                error: 'Database operation failed',
                details: error.message,
                code: error.code
            });
        }
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
    connection.query('UPDATE pkg_voucher SET credit = ?, plan_id = ?, language = ?, prefix_rules = ?, quantity = ?, description = ? WHERE id = ?', 
    [credit, plan, language, prefix_rules, quantity, description, id], 
    (error) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                error: 'Database error', 
                details: error.message 
            });
        }
        res.status(204).send();
    });
};

module.exports = { afficher, ajouter, del, modifier, afficherPlans };