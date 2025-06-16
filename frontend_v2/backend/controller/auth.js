const connection = require("../config/dataBase");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'mcbilling-secret-key';

// Login controller
exports.login = (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", { username });

  // Validate request
  if (!username || !password) {
    console.log("Missing username or password");
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Query to find user by username
  const query = "SELECT * FROM pkg_user WHERE username = ?";
  
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("Query results:", { count: results.length });

    // Check if user exists
    if (results.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    console.log("User found:", { 
      id: user.id, 
      username: user.username, 
      id_group: user.id_group,
      password: user.password ? '***' + user.password.slice(-3) : 'null' 
    });

    // Vérifier si l'utilisateur est administrateur (id_group = 1)
    if (user.id_group !== 1) {
      console.log("Accès refusé - L'utilisateur n'est pas administrateur:", username);
      return res.status(403).json({ 
        error: "Accès refusé. Seuls les administrateurs peuvent se connecter à cette interface.",
        errorType: 'access_denied'
      });
    }
    
    // Importer le module crypto pour le hachage MD5
    const crypto = require('crypto');
    
    // Fonctions de hachage
    const hashMD5 = (string) => crypto.createHash('md5').update(string).digest('hex');
    const hashSHA1 = (string) => crypto.createHash('sha1').update(string).digest('hex');
    
    try {
      let isPasswordValid = false;
      let usedHashType = '';
      
      // Essayer d'abord avec SHA-1 (40 caractères)
      if (user.password.length === 40) {
        const inputHash = hashSHA1(password);
        console.log("Hash SHA-1 généré:", inputHash);
        console.log("Hash stocké:", user.password);
        isPasswordValid = inputHash === user.password.toLowerCase();
        usedHashType = 'SHA-1';
      } 
      // Sinon essayer avec MD5 (32 caractères)
      else if (user.password.length === 32) {
        const inputHash = hashMD5(password);
        console.log("Hash MD5 généré:", inputHash);
        console.log("Hash stocké:", user.password);
        isPasswordValid = inputHash === user.password.toLowerCase();
        usedHashType = 'MD5';
      }
      
      console.log(`Résultat de la comparaison du mot de passe (${usedHashType}):`, isPasswordValid);
      
      if (!isPasswordValid) {
        console.log("Mot de passe incorrect pour l'utilisateur:", username);
        console.log("Type de hachage détecté:", user.password.length === 40 ? 'SHA-1' : 'MD5');
        console.log("Mot de passe fourni:", password);
        console.log("Hash attendu:", user.password);
        return res.status(401).json({ 
          error: "Nom d'utilisateur ou mot de passe incorrect",
          errorType: 'auth_error'
        });
      }
      
      // Si le mot de passe MD5 est valide, on pourrait le rehacher en bcrypt ici
      // Voir la note ci-dessous pour la migration vers bcrypt
      
    } catch (error) {
      console.error("Erreur lors de la vérification du mot de passe:", error);
      return res.status(500).json({ 
        error: "Une erreur est survenue lors de la vérification du mot de passe",
        errorType: 'server_error'
      });
    }
    
    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        id_group: user.id_group 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        id_group: user.id_group
      },
      token
    });
  });
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
