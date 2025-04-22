const express = require('express');
const { afficher, ajouter, del, modifier, afficherProviders } = require('../../controller/Billing/RefillProviders');
const router = express.Router();

// Display all refill providers
router.get('/afficher', afficher);

// Display all providers
router.get('/', afficherProviders);

// Add a new refill provider
router.post('/ajouter', ajouter);

// Delete a refill provider
router.delete('/supprimer/:id', del);

// Modify a refill provider
router.put('/modifier/:id', modifier);

module.exports = router;