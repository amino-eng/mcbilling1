const express = require('express');
const router = express.Router();
const { afficher, ajouter, update, del } = require('../../controller/routes/trunkserrors');

// Routes pour `pkg_trunk_error`
router.get('/afficher', afficher);
router.post('/ajouter', ajouter);
router.put('/update', update);
router.delete('/supprimer/:id', del);

module.exports = router;
