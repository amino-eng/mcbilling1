const { afficherIax, ajouterIax, supprimerIax, UsersIax } = require('../../controller/clients/Iax');
const express = require('express');
const router = express.Router();

router.get('/nom',UsersIax);
router.get('/affiche', afficherIax);
router.post('/ajouter', ajouterIax);
// router.put('/modifier/:id', modifierIax);
router.delete('/delete/:id', supprimerIax);

module.exports = router;
