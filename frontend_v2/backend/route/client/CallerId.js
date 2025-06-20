// ./route/client/CallerId.js
const { 
  afficherCallerId, 
  ajouterCallerId, 
  supprimerCallerId, 
  modifierCallerId, 
  getCallerIdsByUserId,
  importCallerIdsFromCSV 
} = require('../../controller/clients/CallerId');
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Erreur: Seuls les fichiers CSV sont autorisés!');
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Afficher les informations de pkg_callerid
router.get('/affiche', afficherCallerId);

// Ajouter un enregistrement dans pkg_callerid
router.post('/ajouter', ajouterCallerId);

// Supprimer un enregistrement de pkg_callerid
router.delete('/delete/:id', supprimerCallerId);

// Get Caller IDs by User ID
router.get("/user/:userId", getCallerIdsByUserId);

// Import Caller IDs from CSV
router.post("/import", upload.single('file'), importCallerIdsFromCSV);

// Nouvelle route pour la modification
router.put("/modifier/:id", modifierCallerId);

module.exports = router;