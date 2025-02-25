const express =require("express")
const router =express.Router()
const {affiche,userRestrict} =require("../controller/client")
//route pour afficher les restriction 
router.get("/affiche",affiche)
router.get("/afficheuserRestrict",userRestrict)

module.exports = router