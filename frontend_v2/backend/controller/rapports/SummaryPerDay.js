const connection = require("../../config/dataBase");

// Afficher tous les enregistrements
exports.getAll = (req, res) => {
    const query = "SELECT * FROM pkg_cdr_summary_day";
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des données :", err);
            return res.status(500).json({ error: "Erreur de base de données" });
        }
        res.json({ data: results });
    });
};

// Afficher un enregistrement par ID
exports.getById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM pkg_cdr_summary_day";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des données :", err);
            return res.status(500).json({ error: "Erreur de base de données" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }
        res.json({ data: result[0] });
    });
};

// Ajouter un enregistrement
exports.add = (req, res) => {
    const { day, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr } = req.body;

    if (!day || !sessiontime || !aloc_all_calls || !nbcall || !nbcall_fail || !buycost || !sessionbill || !lucro || !asr) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const query = "INSERT INTO pkg_cdr_summary_day (day, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    connection.query(query, [day, sessiontime, aloc_all_calls, nbcall, nbcall_fail, buycost, sessionbill, lucro, asr], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout :", err);
            return res.status(500).json({ error: "Erreur de base de données" });
        }
        res.status(201).json({ message: "Enregistrement ajouté avec succès", id: result.insertId });
    });
};

// Supprimer un enregistrement
exports.del = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM pkg_cdr_summary_day WHERE id = ?";

    connection.query(query, [id], (err, result) => {
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
