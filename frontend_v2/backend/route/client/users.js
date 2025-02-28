const express = require("express");
const { afficherUtilisateurs } = require("../../controller/clients/users");
const router = express.Router();

// Afficher tous les utilisateurs avec leurs informations associées
router.get("/users", afficherUtilisateurs);

module.exports = router;
