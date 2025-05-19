const express = require("express");
const router = express.Router();
const {
  afficher,
  ajouter,
  modifier,
  supprimer,
  getUsernames,
  getPrefixes,
} = require("../../controller/rates/userrate");

router.get("/afficher", afficher);
router.get("/usernames", getUsernames);
router.get("/prefixes", getPrefixes);
router.post("/ajouter", ajouter);
router.put("/modifier/:id", modifier);
router.delete("/supprimer/:id", supprimer);

module.exports = router;
