const express = require("express");
const {
  afficherUtilisateurs,
  afficherGroupes,
  afficherPlans
} = require("../../controller/clients/users");

const router = express.Router();

// Afficher tous les utilisateurs avec leurs informations associées
router.get("/users", afficherUtilisateurs);

// Afficher tous les groupes
router.get("/groups", afficherGroupes);

// Afficher tous les plans
router.get("/plans", afficherPlans);

module.exports = router;