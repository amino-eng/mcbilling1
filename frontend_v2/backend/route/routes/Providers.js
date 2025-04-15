const express = require('express');
const router = express.Router();
const { afficher, ajouter, batchUpdate, del } = require('../../controller/routes/Providers');

// Fetch all providers
router.get('/afficher', afficher);

// Add a new provider
router.post('/ajouter', ajouter);

// Update an existing provider
// Add this to your routes file
router.put('/batchUpdate', batchUpdate);

// Delete a provider
router.delete('/supprimer/:id', del);

module.exports = router;
