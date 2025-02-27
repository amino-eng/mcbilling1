const express = require("express");
const router = express.Router();
const {getAll,getById,add,del}=require('../../controller/rapports/SummaryPerDay')

// Route pour afficher tous les enregistrements
router.get("/",getAll);

// Route pour afficher un enregistrement par ID
router.get("/:id",getById);

// Route pour ajouter un nouvel enregistrement
router.post("/",add);

// Route pour supprimer un enregistrement par ID
router.delete("/:id",del);

module.exports = router;
