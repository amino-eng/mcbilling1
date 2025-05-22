const express = require("express");
const router = express.Router();
const { afficher, ajouter, batchUpdate, deleted, getAllProviders, modifier} = require("../../controller/routes/trunks");

// Fetch all trunks
router.get("/afficher", afficher);

// Add a trunk
router.post("/ajouter", ajouter);

// Batch update trunks
router.put("/batchUpdate", batchUpdate);

// Delete trunk
router.delete("/supprimer/:id", deleted);

router.put("/modifier/:id", modifier);


module.exports = router;
