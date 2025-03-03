// ./route/client/SIPUsers.js
const { afficherSIPUsers, ajouterSIPUser, supprimerSIPUser,sipUsers } = require('../../controller/clients/SIPUsers');
const express = require('express');
const router = express.Router();
router.get('/nom',sipUsers)
router.get('/affiche', afficherSIPUsers);
router.post('/ajouter', ajouterSIPUser);
router.delete('/delete/:id', supprimerSIPUser);

module.exports = router;