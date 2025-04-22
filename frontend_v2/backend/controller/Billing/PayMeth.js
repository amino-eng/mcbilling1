const connection = require("../../config/dataBase");

// Afficher toutes les méthodes de paiement avec pagination et recherche
exports.afficher = (req, res) => {
  const query = `
    SELECT 
      pm.id, 
      pm.payment_method, 
      pm.country,
      pm.active, 
      u.username 
    FROM 
      pkg_method_pay pm
    LEFT JOIN 
      pkg_user u ON pm.id_user = u.id
  `;

  connection.query(query, [], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des méthodes de paiement:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    res.json({ payment_methods: results });
  });
};
// Modifier une méthode de paiement
exports.modifier = (req, res) => {
  const methodId = req.params.id;
  const { payment_method, country, active } = req.body;

  const query = `
    UPDATE pkg_method_pay 
    SET payment_method = ?, country = ?, active = ? 
    WHERE id = ?
  `;

  connection.query(query, [payment_method, country, active, methodId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la modification de la méthode de paiement:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Méthode de paiement non trouvée" });
    }

    res.status(200).json({ message: "Méthode de paiement modifiée avec succès" });
  });
};

// Supprimer une méthode de paiement
exports.del = (req, res) => {
  const methodId = req.params.id;

  if (!methodId) {
    return res.status(400).json({ error: "ID est requis" });
  }

  const query = "DELETE FROM pkg_method_pay WHERE id = ?";

  connection.query(query, [methodId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la méthode de paiement:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Méthode de paiement non trouvée" });
    }

    res.status(200).json({ message: "Méthode de paiement supprimée avec succès" });
  });
};

// Ajouter une méthode de paiement
exports.ajouter = (req, res) => {
  const { 
    payment_method, 
    country, 
    show_name = payment_method,
    username = '',
    url = '',
    active = false,
    min_amount = '1',
    max_amount = '15',
    id_user // This should be provided and must be a valid user ID
  } = req.body;
  
  console.log(req.body);
  
  // Verify required fields
  if (!payment_method || !country || !id_user) {
    return res.status(400).json({ error: "Les champs payment_method, country et id_user sont obligatoires" });
  }

  // Convert active boolean to tinyint
  const activeValue = active ? 1 : 0;
  
  // Use min_amount and max_amount from request or defaults
  const min = min_amount || 10;
  const max = max_amount || 10;

  const query = `
    INSERT INTO pkg_method_pay (
      payment_method, 
      country,
      id_user,
      show_name,
      username,
      url,
      active,
      min,
      max,
      pagseguro_TOKEN,
      P2P_CustomerSiteID,
      P2P_KeyID,
      P2P_Passphrase,
      P2P_RecipientKeyID,
      P2P_tax_amount
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query, 
    [
      payment_method, 
      country,
      id_user,
      show_name,
      username,
      url,
      activeValue,
      min,
      max,
      '', // pagseguro_TOKEN - empty string default
      '', // P2P_CustomerSiteID - empty string default
      '', // P2P_KeyID - empty string default
      '', // P2P_Passphrase - empty string default
      '', // P2P_RecipientKeyID - empty string default
      '0'  // P2P_tax_amount - default to '0'
    ], 
    (error, results) => {
      if (error) {
        console.error("Erreur de base de données:", error);
        
        // Provide more specific error messages for common errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ 
            error: "L'ID utilisateur fourni n'existe pas dans la table pkg_user", 
            details: error.message 
          });
        } else if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
          return res.status(400).json({ 
            error: "Un champ obligatoire n'a pas de valeur par défaut", 
            details: error.message 
          });
        }
        
        return res.status(500).json({ error: "Erreur de base de données", details: error.message });
      }

      // Return the ID of the new payment method
      res.status(201).json({ 
        message: "Méthode de paiement ajoutée avec succès", 
        id: results.insertId 
      });
    }
  );
};