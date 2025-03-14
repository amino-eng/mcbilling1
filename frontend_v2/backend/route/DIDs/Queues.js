const express = require('express');
const { afficherQueues, ajouterQueue, modifierQueue, delQueue } = require('../../controller/DIDs/Queues');
const router = express.Router();

// Fetch all Queues with user details
router.get('/', afficherQueues);

// Add a new Queue
router.post('/', ajouterQueue);

// Update an existing Queue
router.put('/:id', modifierQueue);

// Delete a Queue
router.delete('/:id', delQueue);

module.exports = router;
