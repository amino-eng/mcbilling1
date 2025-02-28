const express = require("express");
const router = express.Router();

// ⚠️ Assure-toi que le chemin du fichier est correct
const { 
    getTotalClients, 
    getTotalFactures, 
    getRevenusMensuels, 
    getAppelsMensuels 
} = require("../../controller/dashboard/dashboard");

// ✅ Routes avec des chemins uniques
router.get("/total-clients", getTotalClients);
router.get("/total-factures", getTotalFactures);
router.get("/revenus-mensuels", getRevenusMensuels);
router.get("/appels-mensuels", getAppelsMensuels);

module.exports = router;
