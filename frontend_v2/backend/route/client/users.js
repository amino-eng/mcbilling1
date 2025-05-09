const express = require("express");
const router = express.Router();
const {
    afficherUtilisateurs,
    afficherGroupes,
    afficherPlans,
    ajouterUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    getUtilisateur,
    getUserSipAccounts,
    getUserIaxAccounts,
    getUserPassword
} = require("../../controller/clients/users");

// Afficher tous les utilisateurs avec leurs informations associées
router.get("/affiche", afficherUtilisateurs);
router.get("/users", afficherUtilisateurs); // Keeping original route for backward compatibility

// Afficher tous les groupes
router.get("/groups", afficherGroupes);

// Afficher tous les plans
router.get("/plans", afficherPlans);

// Obtenir un utilisateur spécifique
router.get("/user/:id", getUtilisateur);

// Obtenir les comptes SIP d'un utilisateur
router.get("/user/:id/sip", getUserSipAccounts);

// Obtenir les comptes IAX d'un utilisateur
router.get("/user/:id/iax", getUserIaxAccounts);

// Obtenir le mot de passe d'un utilisateur
router.get("/user/:id/password", getUserPassword);

// Ajouter un utilisateur
router.post("/ajouter", ajouterUtilisateur);

// Supprimer un utilisateur
router.delete("/supprimer/:id", supprimerUtilisateur);

// Modifier un utilisateur
router.put("/modifier/:id", modifierUtilisateur);

module.exports = router;