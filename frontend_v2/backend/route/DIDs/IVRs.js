const express = require("express");
const router = express.Router();
const { afficher, getById, add, modify, del } = require("../../controller/DIDs/IVRs");

// Routes IVR
router.get("/affiche", afficher);
router.get("/get/:id", getById);
router.post("/add", add);
router.put("/modify/:id", modify); // New route for modifying IVR
router.delete("/delete/:id", del);

module.exports = router;