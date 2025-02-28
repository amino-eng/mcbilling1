const { afficher, ajouter, del } = require('../../controller/rapports/CDRFailed');
const express = require('express');
const router = express.Router();

// Afficher toutes les entrées CDR échouées avec jointure
router.get('/affiche', afficher);

// Ajouter un enregistrement CDR échoué
router.post('/ajouter', ajouter);

// Supprimer un enregistrement CDR échoué
router.delete('/delete/:id', del);

module.exports = router;
