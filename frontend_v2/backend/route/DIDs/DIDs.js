const express = require('express');
const { afficher, ajouter, modifier, del } = require('../../controller/DIDs/DIDs');
const router = express.Router();

// Fetch all DIDs
router.get('/afficher', afficher);

// Add a new DID
router.post('/ajouter', ajouter);

// Update an existing DID
router.put('/modifier/:id', modifier);

// Delete a DID
router.delete('/supprimer/:id', del);

module.exports = router;