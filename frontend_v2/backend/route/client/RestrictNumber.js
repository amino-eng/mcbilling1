const express = require("express")
const router = express.Router()
const restrictNumberController = require('../../controller/clients/RestrictNumber');
router.get("/affiche", restrictNumberController.affiche)
router.get("/afficheuserRestrict", restrictNumberController.userRestrict)
router.post("/add", restrictNumberController.addRestriction)
router.put("/edit/:id", restrictNumberController.editRestriction);
router.delete("/delete/:id", restrictNumberController.delete)

module.exports = router