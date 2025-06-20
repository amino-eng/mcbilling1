const express = require('express');
const router = express.Router();
const { afficher, del, getById, add, getDIDs, deleteByDid, update, getSipUsersByUserId } = require('../../controller/DIDs/DIDDestination');

// Affichage des destinations DID
router.get('/affiche', afficher);

// Supprimer une destination DID par ID
router.delete('/delete/:id', del);

// Supprimer une destination DID par numéro DID
router.delete('/deleteByDid/:did', deleteByDid);

// Afficher une destination DID par ID avec le username
router.get('/get/:id', getById);

// Get all DIDs from pkg_did table
router.get('/getDIDs', getDIDs);

// Ajouter une nouvelle destination DID
router.post('/add', add);

// Mettre à jour une destination DID
router.put('/update', update);

// Get SIP users by user ID
router.get('/getSipUsersByUserId/:userId', getSipUsersByUserId);

module.exports = router;