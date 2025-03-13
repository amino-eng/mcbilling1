
const express = require("express");
const router = express.Router();
const {
    afficherUtilisateurs,
    afficherGroupes,
    afficherPlans,
    ajouterUtilisateur ,
    supprimerUtilisateur,
    modifierUtilisateur
} = require("../../controller/clients/users");


// Afficher tous les utilisateurs avec leurs informations associées
router.get("/users", afficherUtilisateurs);

// Afficher tous les groupes
router.get("/groups", afficherGroupes);

// Afficher tous les plans
router.get("/plans", afficherPlans);

router.post("/ajouter", ajouterUtilisateur);
//supprimerUtilisateur  

router.delete("/supprimer/:id", supprimerUtilisateur);

// Nouvelle route pour la modification
router.put("/modifier/:id", modifierUtilisateur);
module.exports = router;