const express = require('express');
const { afficher, ajouter, del, modifier } = require('../../controller/Billing/PayMeth');
const router = express.Router();

// Afficher toutes les méthodes de paiement
router.get('/afficher', afficher);

// Ajouter une nouvelle méthode de paiement
router.post('/ajouter', ajouter);

// Supprimer une méthode de paiement
router.delete('/supprimer/:id', del);

// Modifier une méthode de paiement
router.put('/modifier/:id', modifier);

module.exports = router;