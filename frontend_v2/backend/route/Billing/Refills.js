const express = require('express');
const router = express.Router();
const { afficher, del, getById } = require('../../controller/Billing/Refills');

// Affichage des refills
router.get('/affiche', afficher);

// Supprimer un refill par id
router.delete('/delete/:id', del);

// Afficher un refill par id avec le username
router.get('/get/:id', getById);

module.exports = router;