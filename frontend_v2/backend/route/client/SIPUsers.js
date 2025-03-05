// ./route/client/SIPUsers.js
const { afficherSIPUsers, ajouterSIPUser, supprimerSIPUser,sipUsers, trunkGroups } = require('../../controller/clients/SIPUsers');
const express = require('express');
const router = express.Router();
router.get('/nom',sipUsers)
router.get('/trunk',trunkGroups)
router.get('/affiche', afficherSIPUsers);
router.post('/ajouter', ajouterSIPUser);
router.delete('/delete/:id', supprimerSIPUser);

module.exports = router;