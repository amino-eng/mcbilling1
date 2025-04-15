const express = require('express');
const { afficher, ajouter, modifier, del, } = require('../../controller/DIDs/QueuesMembers');
const router = express.Router();

// Fetch all Queue Members
router.get('/', afficher);

// Add a new Queue Member
router.post('/ajouter',ajouter);

// Update an existing Queue Member
router.put('/:id', modifier);

// Delete a Queue Member
router.delete('/:id', del);



module.exports = router;  