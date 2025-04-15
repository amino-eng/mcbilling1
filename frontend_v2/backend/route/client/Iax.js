const express = require('express');
const { afficherIax, ajouterIax, supprimerIax, modifierIax, UsersIax } = require('../../controller/clients/Iax');
const router = express.Router();

router.get('/nom', UsersIax);
router.get('/affiche', afficherIax);
router.post('/ajouter', ajouterIax);
router.put('/modifier/:id', modifierIax); // new route
router.delete('/delete/:id', supprimerIax);

module.exports = router;