const express = require('express');
const { afficher, ajouter, del, modifier, afficherPlans } = require('../../controller/Billing/Voucher');
const router = express.Router();

// Display all vouchers
router.get('/afficher', afficher);

// Display all plans
router.get('/plans', afficherPlans); // Ensure this line is present

// Add a new voucher
router.post('/ajouter', ajouter);

// Delete a voucher
router.delete('/supprimer/:id', del);

// Modify a voucher
router.put('/modifier/:id', modifier);

module.exports = router;