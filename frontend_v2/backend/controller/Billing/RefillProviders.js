const connection = require('../../config/database');

// Display all refill providers with provider name
const afficher = (req, res) => {
    const query = `
        SELECT r.*, p.provider_name 
        FROM pkg_refill_provider r 
        JOIN pkg_provider p ON r.id_provider = p.id
    `;
    connection.query(query, (error, results) => {
        if (error) return res.status(500).json({ error });
        res.json({ providers: results });
    });
};

// Add a new refill provider
const ajouter = (req, res) => {
    const { provider, credit, description, payment } = req.body;
    connection.query('INSERT INTO pkg_refill_provider (id_provider, credit, description, payment) VALUES (?, ?, ?, ?)', 
    [provider, credit, description, payment], 
    (error, results) => {
        if (error) return res.status(500).json({ error });
        res.status(201).json({ id: results.insertId });
    });
};

// Display all providers
const afficherProviders = (req, res) => {
    connection.query('SELECT id, provider_name FROM pkg_provider', (error, results) => {
        if (error) return res.status(500).json({ error });
        res.json({ providers: results });
    });
};

// Delete a refill provider
const del = (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM pkg_refill_provider WHERE id = ?', [id], (error) => {
        if (error) return res.status(500).json({ error });
        res.status(204).send();
    });
};

// Modify a refill provider
const modifier = (req, res) => {
    const { id } = req.params;
    const { provider, credit, description, payment } = req.body;
    connection.query('UPDATE pkg_refill_provider SET id_provider = ?, credit = ?, description = ?, payment = ? WHERE id = ?', 
    [provider, credit, description, payment, id], 
    (error) => {
        if (error) return res.status(500).json({ error });
        res.status(204).send();
    });
};

module.exports = { afficher, ajouter, del, modifier, afficherProviders };