const { afficher, ajouter, del } = require('../../controller/clients/UserHistory');
const express = require('express');
const router = express.Router();

// Afficher l'historique des utilisateurs
router.get('/affiche', afficher);

// Ajouter un enregistrement dans l'historique des utilisateurs
router.post('/ajouter', ajouter);

// Supprimer un enregistrement de l'historique des utilisateurs
router.delete('/delete/:id', del);

module.exports = router;