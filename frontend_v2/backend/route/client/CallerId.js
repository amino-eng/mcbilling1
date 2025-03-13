// ./route/client/CallerId.js
const { afficherCallerId, ajouterCallerId, supprimerCallerId,modifierCallerId } = require('../../controller/clients/CallerId');
const express = require('express');
const router = express.Router();

// Afficher les informations de pkg_callerid
router.get('/affiche', afficherCallerId);

// Ajouter un enregistrement dans pkg_callerid
router.post('/ajouter', ajouterCallerId);

// Supprimer un enregistrement de pkg_callerid
router.delete('/delete/:id', supprimerCallerId);

// Nouvelle route pour la modification
router.put("/modifier/:id", modifierCallerId);

module.exports = router;