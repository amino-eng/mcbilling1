const { afficher, del, getById } = require("../../controller/rapports/SummaryDayUser");
const express = require("express");
const router = express.Router();

// Routes pour SummaryDayUser
router.get("/affiche", afficher);
router.delete("/delete/:id", del);
router.get("/get/:id", getById);

module.exports = router;
