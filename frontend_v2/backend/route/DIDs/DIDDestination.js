const express = require('express');
const router = express.Router();
const { afficher, del, getById, add } = require('../../controller/DIDs/DIDDestination');

// Affichage des destinations DID
router.get('/affiche', afficher);

// Supprimer une destination DID par ID
router.delete('/delete/:id', del);

// Afficher une destination DID par ID avec le username
router.get('/get/:id', getById);

// Ajouter une nouvelle destination DID
router.post('/add', add);

module.exports = router;