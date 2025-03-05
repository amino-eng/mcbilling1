const { afficher, del, getById } = require('../../controller/rapports/CallArchive');
const express = require('express');
const router = express.Router();

// Affichage des CDR Archive
router.get('/affiche', afficher);
router.delete('/delete/:id', del);
router.get('/get/:id', getById);

module.exports = router;