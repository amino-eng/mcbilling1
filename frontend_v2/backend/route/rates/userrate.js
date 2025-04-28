const express = require("express");
const router = express.Router();
const {
  afficher,
  ajouter,
  modifier,
  supprimer,
} = require("../../controller/rates/userrate");

router.get("/afficher", afficher);
router.post("/ajouter", ajouter);
router.put("/modifier/:id", modifier);
router.delete("/supprimer/:id", supprimer);

module.exports = router;
