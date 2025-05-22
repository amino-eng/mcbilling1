const connection = require('../../config/database');
const pool = connection.pool; // Assuming you have a pool setup in your database config

// Display all vouchers
const afficher = (req, res) => {
    connection.query('SELECT * FROM pkg_voucher ORDER BY creationdate DESC', (error, results) => {
        if (error) return res.status(500).json({ error });
        res.json({ vouchers: results });
    });
};

// Display all plans
const afficherPlans = (req, res) => {
    connection.query('SELECT * FROM pkg_plan ORDER BY name ASC', (error, results) => {
        if (error) {
            console.error("Error fetching plans:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No plans found" });
        }
        res.json({ plans: results });
    });
};

// Add a new voucher
const ajouter = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Validation stricte
    if (isNaN(req.body.credit) || isNaN(req.body.id_plan)) {
      throw new Error('Credit et Plan doivent être des nombres valides');
    }

    // 2. Vérification du plan
    const [plan] = await connection.query(
      'SELECT id FROM pkg_plan WHERE id = ? FOR UPDATE',
      [req.body.id_plan]
    );
    
    if (plan.length === 0) {
      throw new Error(`Le plan ${req.body.id_plan} n'existe pas`);
    }

    // 3. Préparation des données avec valeurs par défaut
    const voucherData = {
      credit: parseFloat(req.body.credit),
      id_plan: parseInt(req.body.id_plan),
      used: parseInt(req.body.used) || 0,
      language: req.body.language?.substring(0, 2) || 'fr',
      prefix_local: req.body.prefix_local?.substring(0, 10) || '',
      tag: req.body.tag?.substring(0, 255) || '',
      voucher: req.body.voucher || `VOUCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      creationdate: new Date()
    };

    // 4. Insertion avec vérification
    const [result] = await connection.query(
      'INSERT INTO pkg_voucher SET ?',
      voucherData
    );

    await connection.commit();
    
    res.json({
      success: true,
      id: result.insertId,
      voucher_code: voucherData.voucher
    });

  } catch (err) {
    await connection.rollback();
    
    console.error('[VOUCHER ERROR]', {
      timestamp: new Date().toISOString(),
      error: err.message,
      stack: err.stack,
      payload: req.body
    });
    
    res.status(500).json({
      success: false,
      error: err.message,
      code: 'VOUCHER_CREATION_FAILED'
    });
  } finally {
    connection.release();
  }
};

// Delete a voucher
const del = (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM pkg_voucher WHERE id = ?', [id], (error) => {
        if (error) return res.status(500).json({ error });
        res.status(204).send();
    });
};

// Modify a voucher
const modifier = (req, res) => {
    const { id } = req.params;
    const { credit, plan, language, prefix_rules, quantity, description } = req.body;
    connection.query('UPDATE pkg_voucher SET credit = ?, plan = ?, language = ?, prefix_rules = ?, quantity = ?, description = ? WHERE id = ?', 
    [credit, plan, language, prefix_rules, quantity, description, id], 
    (error) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                error: 'Database error', 
                details: error.message 
            });
        }
        res.status(204).send();
    });
};

module.exports = { afficher, ajouter, del, modifier, afficherPlans };