const connection = require("../../config/dataBase");

// Fetch all Queues with user details, sorted by name or id_user based on request
exports.afficher = (req, res) => {
  const sortBy = req.query.sortBy || 'name'; // Default sort by name
  const query = `
    SELECT 
      q.*,  
      u.id AS user_id,
      u.username AS username
    FROM 
      pkg_queue q
    LEFT JOIN 
      pkg_user u ON q.id_user = u.id
    ORDER BY 
      ${sortBy} ASC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des queues:", err.message);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucune queue trouvée" });
    }

    res.json({ queues: results });
  });
};

// Add a new Queue
exports.ajouter = (req, res) => {
    const { 
        name, id_user, language, musiconhold, announce, context, timeout, announceFrequency, announceRoundSeconds, announceHoldtime,
        announcePosition = 'def', retry, wrapuptime, maxlen, servicelevel, strategy = '', joinempty, leavewhenempty, eventmemberstatus, eventwhencalled,
        reportholdtime, memberdelay, weight, timeoutrestart, periodicAnnounce, periodicAnnounceFrequency, ringinuse, setinterfacevar, setqueuevar='', 
        setqueueentryvar='', varHoldtime=0, varTalktime=0 , varTotalCalls=0 , varAnsweredCalls=0 , ringOrMoh='', maxWaitTime, maxWaitTimeAction 
    } = req.body;

    // Ensure required fields are provided
    if (!name || !id_user || !language) {
        console.log("Missing fields:", { name, id_user, language });
        return res.status(400).json({ error: "Name, User ID, and Language are required" });
    }

    // Default values for optional fields if not provided
    const query = `
        INSERT INTO pkg_queue 
          (name, id_user, language, musiconhold, announce, context, timeout, \announce-frequency\, \announce-round-seconds\, \announce-holdtime\,
          \announce-position\, retry, wrapuptime, maxlen, servicelevel, strategy, \joinempty\, leavewhenempty, eventmemberstatus, eventwhencalled,
          reportholdtime, memberdelay, weight, timeoutrestart, \periodic-announce\, \periodic-announce-frequency\, ringinuse, setinterfacevar, setqueuevar,
          setqueueentryvar, var_holdtime, var_talktime, var_totalCalls, var_answeredCalls, \ring_or_moh\, max_wait_time, max_wait_time_action)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Parameters for the query
    const params = [
        name, 
        id_user, 
        language, 
        musiconhold, 
        announce, 
        context, 
        timeout, 
        announceFrequency, 
        announceRoundSeconds, 
        announceHoldtime, 
        announcePosition, 
        retry, 
        wrapuptime, 
        maxlen, 
        servicelevel, 
        strategy, 
        joinempty, 
        leavewhenempty,
        eventmemberstatus, 
        eventwhencalled, 
        reportholdtime, 
        memberdelay, 
        weight, 
        timeoutrestart, 
        periodicAnnounce, 
        periodicAnnounceFrequency, 
        ringinuse, 
        setinterfacevar, 
        setqueuevar, 
        setqueueentryvar, 
        varHoldtime, 
        varTalktime, 
        varTotalCalls, 
        varAnsweredCalls, 
        ringOrMoh, 
        maxWaitTime, 
        maxWaitTimeAction
    ];

    // Execute the query
    connection.query(query, params, (error, results) => {
        if (error) {
            console.log("Error inserting queue:", error);
            return handleDatabaseError(res, error);
        }

        res.status(201).json({ message: "Queue added successfully", id: results.insertId });
    });
};

// Update a Queue
exports.modifier = (req, res) => {
  const queueId = req.params.id;
  const { username, language, strategy, talk_time, total_calls, answered } = req.body;

  const query = `
    UPDATE pkg_queue 
    SET username = ?, language = ?, strategy = ?, talk_time = ?, total_calls = ?, answered = ? 
    WHERE id = ?
  `;

  connection.query(query, [username, language, strategy, talk_time, total_calls, answered, queueId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la mise à jour de la queue:", error);
      return res.status(500).json({ error: "Erreur de base de données", details: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Queue non trouvée" });
    }

    res.status(200).json({ message: "Queue mise à jour avec succès" });
  });
};

// Delete a Queue
exports.del = (req, res) => {
  const queueId = req.params.id;

  const query = "DELETE FROM pkg_queue WHERE id = ?";

  connection.query(query, [queueId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la queue:", err);
      return res.status(500).json({ error: "Erreur de base de données", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Queue non trouvée" });
    }

    res.status(200).json({ message: "Queue supprimée avec succès" });
  });
};