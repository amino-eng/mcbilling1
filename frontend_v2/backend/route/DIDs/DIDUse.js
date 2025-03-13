const express = require('express');
const router = express.Router();
const { afficher, del, getById, add } = require('../../controller/DIDs/DIDUse');

// Afficher tous les DIDs Users
router.get('/affiche', afficher);

// Supprimer un DID User par ID
router.delete('/delete/:id', del);

// Afficher un DID User par ID
router.get('/get/:id', getById);

// Ajouter un nouveau DID User
router.post('/add', add);

module.exports = router;
