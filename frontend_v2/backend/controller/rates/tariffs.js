const connection = require("../../config/dataBase");

// Get all tariffs with joins
exports.afficher = (req, res) => {
    const query = `
    SELECT 
      r.*, 
      r.rateinitial AS sell_price,
      r.initblock AS initial_block,
      r.billingblock AS billing_block,
      p.name AS plan, 
      pr.destination AS destination, 
      pr.prefix AS prefix,
      tg.name AS trunk_group_name, 
      tg.description AS trunk_group_description
    FROM pkg_rate AS r
    LEFT JOIN pkg_plan AS p ON r.id_plan = p.id
    LEFT JOIN pkg_prefix AS pr ON r.id_prefix = pr.id
    LEFT JOIN pkg_trunk_group AS tg ON r.id_trunk_group = tg.id
    ORDER BY r.rateinitial, r.initblock, r.billingblock
  `;
  
  
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tarifs:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun tarif trouvé" });
    }

    res.json({ tarifs: results });
  });
};

// Ajouter un nouveau tarif
// Ajouter un nouveau tarif
exports.ajouter = (req, res) => {
    const { 
      id_plan, 
      id_prefix, 
      id_trunk_group, 
      rateinitial,
      initblock = 1,
      billingblock = 1,
      minimal_time_charge = 0,
      additional_grace = 0,
      connectcharge = 0,
      package_offer = 0,
      status = 1
    } = req.body;

    // Validate required fields
    if (!id_plan || !id_prefix || !id_trunk_group || rateinitial === undefined) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: id_plan, id_prefix, id_trunk_group, and rateinitial are required" 
      });
    }

    // Validate rate is a positive number
    if (isNaN(parseFloat(rateinitial)) || parseFloat(rateinitial) < 0) {
      return res.status(400).json({
        success: false,
        error: "Rate must be a positive number"
      });
    }

    // Check if rate already exists for this combination
    const checkQuery = `
      SELECT id FROM pkg_rate 
      WHERE id_plan = ? AND id_prefix = ? AND id_trunk_group = ?
      LIMIT 1
    `;

    connection.query(
      checkQuery, 
      [id_plan, id_prefix, id_trunk_group], 
      (err, results) => {
        if (err) {
          console.error("Error checking for existing rate:", err.message);
          return res.status(500).json({ 
            success: false,
            error: "Database error while checking for existing rate",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }


        if (results.length > 0) {
          return res.status(409).json({
            success: false,
            error: "A rate with these parameters already exists"
          });
        }


        // Insert the new rate
        const insertQuery = `
          INSERT INTO pkg_rate (
            id_plan, 
            id_prefix, 
            id_trunk_group,
            rateinitial,
            initblock,
            billingblock,
            minimal_time_charge,
            additional_grace,
            connectcharge,
            package_offer,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          id_plan, 
          id_prefix, 
          id_trunk_group,
          rateinitial,
          initblock,
          billingblock,
          minimal_time_charge,
          additional_grace,
          connectcharge,
          package_offer,
          status
        ];

        connection.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error("Error adding rate:", err.message);
            
            // Handle foreign key constraint violations
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              const match = err.message.match(/FOREIGN KEY \(`(.*?)`\)/);
              const field = match ? match[1] : 'reference';
              return res.status(400).json({
                success: false,
                error: `Invalid ${field} provided`,
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
              });
            }


            return res.status(500).json({ 
              success: false,
              error: "Failed to add rate",
              details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
          }

          // Get the newly created rate with joined data
          const getRateQuery = `
            SELECT r.*, p.name as plan_name, pr.prefix, pr.destination, tg.name as trunk_group_name
            FROM pkg_rate r
            LEFT JOIN pkg_plan p ON r.id_plan = p.id
            LEFT JOIN pkg_prefix pr ON r.id_prefix = pr.id
            LEFT JOIN pkg_trunk_group tg ON r.id_trunk_group = tg.id
            WHERE r.id = ?
          `;

          connection.query(getRateQuery, [result.insertId], (err, rateResults) => {
            if (err || rateResults.length === 0) {
              // If we can't get the full rate details, just return the ID
              return res.status(201).json({
                success: true,
                message: "Rate added successfully",
                data: { id: result.insertId }
              });
            }


            res.status(201).json({
              success: true,
              message: "Rate added successfully",
              data: rateResults[0]
            });
          });
        });
      }
    );
};

// Modifier un tarif
exports.modifier = (req, res) => {
  const id = req.params.id;
  const { 
    id_plan, 
    id_prefix, 
    id_trunk_group, 
    rateinitial,
    initblock = 1,
    billingblock = 1,
    minimal_time_charge = 0,
    additional_grace = 0,
    connectcharge = 0,
    package_offer = 0,
    status = 1
  } = req.body;

  // Validate required fields
  if (!id_plan || !id_prefix || !id_trunk_group || rateinitial === undefined) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required fields: id_plan, id_prefix, id_trunk_group, and rateinitial are required" 
    });
  }

  // Validate rate is a positive number
  if (isNaN(parseFloat(rateinitial)) || parseFloat(rateinitial) < 0) {
    return res.status(400).json({
      success: false,
      error: "Rate must be a positive number"
    });
  }

  // First, check if the rate exists
  connection.query("SELECT * FROM pkg_rate WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error checking rate:", err.message);
      return res.status(500).json({ 
        success: false,
        error: "Database error while checking rate",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Rate not found"
      });
    }

    const currentRate = results[0];

    // Check if the update would create a duplicate
    const checkDuplicateQuery = `
      SELECT id FROM pkg_rate 
      WHERE id_plan = ? AND id_prefix = ? AND id_trunk_group = ? AND id != ?
      LIMIT 1
    `;

    connection.query(
      checkDuplicateQuery, 
      [id_plan, id_prefix, id_trunk_group, id],
      (err, duplicateResults) => {
        if (err) {
          console.error("Error checking for duplicate rate:", err.message);
          return res.status(500).json({ 
            success: false,
            error: "Database error while checking for duplicate rate",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            error: "A rate with these parameters already exists"
          });
        }


        // Update the rate
        const updateQuery = `
          UPDATE pkg_rate 
          SET 
            id_plan = ?, 
            id_prefix = ?, 
            id_trunk_group = ?,
            rateinitial = ?,
            initblock = ?,
            billingblock = ?,
            minimal_time_charge = ?,
            additional_grace = ?,
            connectcharge = ?,
            package_offer = ?,
            status = ?,
            updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          id_plan, 
          id_prefix, 
          id_trunk_group,
          rateinitial,
          initblock,
          billingblock,
          minimal_time_charge,
          additional_grace,
          connectcharge,
          package_offer,
          status,
          id
        ];

        connection.query(updateQuery, values, (err, result) => {
          if (err) {
            console.error("Error updating rate:", err.message);
            
            // Handle foreign key constraint violations
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              const match = err.message.match(/FOREIGN KEY \(`(.*?)`\)/);
              const field = match ? match[1] : 'reference';
              return res.status(400).json({
                success: false,
                error: `Invalid ${field} provided`,
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
              });
            }


            return res.status(500).json({ 
              success: false,
              error: "Failed to update rate",
              details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
          }


          if (result.affectedRows === 0) {
            return res.status(404).json({ 
              success: false,
              error: "Rate not found or no changes made"
            });
          }


          // Get the updated rate with joined data
          const getRateQuery = `
            SELECT r.*, p.name as plan_name, pr.prefix, pr.destination, tg.name as trunk_group_name
            FROM pkg_rate r
            LEFT JOIN pkg_plan p ON r.id_plan = p.id
            LEFT JOIN pkg_prefix pr ON r.id_prefix = pr.id
            LEFT JOIN pkg_trunk_group tg ON r.id_trunk_group = tg.id
            WHERE r.id = ?
          `;

          connection.query(getRateQuery, [id], (err, rateResults) => {
            if (err || rateResults.length === 0) {
              return res.json({
                success: true,
                message: "Rate updated successfully",
                data: { id }
              });
            }


            res.json({
              success: true,
              message: "Rate updated successfully",
              data: rateResults[0]
            });
          });
        });
      }
    );
  });
};

// Supprimer un tarif
exports.supprimer = (req, res) => {
  const id = req.params.id;

  // First, check if the rate exists
  connection.query("SELECT * FROM pkg_rate WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error checking rate:", err.message);
      return res.status(500).json({ 
        success: false,
        error: "Database error while checking rate",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Rate not found"
      });
    }

    const rate = results[0];

    // Now delete the rate
    connection.query("DELETE FROM pkg_rate WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting rate:", err.message);
        
        // Check for foreign key constraint violation
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({
            success: false,
            error: "Cannot delete this rate as it is being used by other records",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }

        return res.status(500).json({ 
          success: false,
          error: "Failed to delete rate",
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          error: "Rate not found"
        });
      }

      res.json({ 
        success: true,
        message: "Rate deleted successfully",
        data: {
          id: rate.id,
          prefix: rate.prefix,
          rate: rate.rateinitial
        }
      });
    });
  });
};
