const express =require("express")
const router =express.Router()
const controller =require("../controller/client")//route pour afficher les restriction 
router.get("/affiche",controller.affiche)
router.get("/afficheuserRestrict",controller.userRestrict)
router.post("/add",controller.addRestriction)
router.put("/edit/:id", controller.editRestriction);
router.delete("/delete/:id",controller.delete)

module.exports = router