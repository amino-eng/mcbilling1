const {afficher,del,getById}=require('../../controller/rapports/CDR')
const express = require('express');
const router =express.Router()
//affichage des CDR 
router.get('/affiche',afficher)
router.delete('/delete/:id',del)
router.get('/get/:id',getById)
module.exports=router