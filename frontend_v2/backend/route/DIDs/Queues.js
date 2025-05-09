const express = require('express');
const { afficher, ajouter, modifier, del } = require('../../controller/DIDs/Queues');
const router = express.Router();

// Fetch all Queues
router.get('/afficher', afficher);

// Add a new Queue
router.post('/ajouter', ajouter);

// Update an existing Queue
router.put('/modifier/:id', modifier);

// Delete a Queue
router.delete('/supprimer/:id', del);

module.exports = router;