const express = require('express');
const { afficher, ajouter, modifier, del, getQueues, getSIPUsers } = require('../../controller/DIDs/QueuesMembers');
const router = express.Router();

router.get('/', afficher);
router.post('/ajouter', ajouter);
router.put('/:id', modifier);
router.delete('/:id', del);
router.get('/queues', getQueues);
router.get('/sip-users', getSIPUsers);
module.exports = router;