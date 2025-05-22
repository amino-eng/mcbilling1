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

// Nouvelle route de diagnostic
router.get('/structure', async (req, res) => {
  try {
    connection.query('DESCRIBE pkg_voucher', (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ structure: results });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;