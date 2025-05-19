const express = require('express');
const router = express.Router();
const { afficher, ajouter, batchUpdate, del, modifier } = require('../../controller/routes/Providers');

// Fetch all providers
router.get('/afficher', afficher);

// Add a new provider
router.post('/ajouter', ajouter);

// Update a provider
router.put('/modifier/:id', modifier);

// Update multiple providers
router.put('/batchUpdate', batchUpdate);

// Delete a provider
router.delete('/supprimer/:id', del);

module.exports = router;
