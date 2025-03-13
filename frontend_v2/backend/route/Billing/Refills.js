const express = require('express');
const router = express.Router();
const { afficher, del, getById,add } = require('../../controller/Billing/Refills');

// Affichage des refills
router.get('/affiche', afficher);

// Supprimer un refill par id
router.delete('/delete/:id', del);

// Afficher un refill par id avec le username
router.get('/get/:id', getById);

// Ajouter un nouveau refill

router.post('/add', add);

module.exports = router;