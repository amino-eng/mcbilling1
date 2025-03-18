const connection = require("../../config/dataBase");

// Utility function for handling database errors
const handleDatabaseError = (res, error) => {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error", details: error.message });
};

// Fetch all Queues with user details (id_user = username)
exports.afficherQueues = (req, res) => {
    const query = `
 SELECT 
  q.*,  
  u.id AS user_id,  
  u.username AS username
FROM 
  pkg_queue q
LEFT JOIN 
  pkg_user u
ON 
  q.id_user = u.id;
  `;

    connection.query(query, (err, results) => {
        if (err) return handleDatabaseError(res, err);
        if (results.length === 0) return res.status(404).json({ message: "No Queues found" });
        res.json({ queues: results });
    });
};

// Add a new Queue
exports.ajouterQueue = (req, res) => {
    // Log the incoming request body to check the data
    console.log("Received request body:", req.body);

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
          (name, id_user, language, musiconhold, announce, context, timeout, \`announce-frequency\`, \`announce-round-seconds\`, \`announce-holdtime\`,
          \`announce-position\`, retry, wrapuptime, maxlen, servicelevel, strategy, \`joinempty\`, leavewhenempty, eventmemberstatus, eventwhencalled,
          reportholdtime, memberdelay, weight, timeoutrestart, \`periodic-announce\`, \`periodic-announce-frequency\`, ringinuse, setinterfacevar, setqueuevar,
          setqueueentryvar, var_holdtime, var_talktime, var_totalCalls, var_answeredCalls, \`ring_or_moh\`, max_wait_time, max_wait_time_action)
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


// Update an existing Queue
exports.modifierQueue = (req, res) => {
    const queueId = req.params.id;
    const { queue_name, id_user } = req.body;

    if (!queue_name || !id_user) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
    UPDATE pkg_queue 
    SET queue_name = ?, id_user = ? 
    WHERE id = ?
  `;

    connection.query(query, [queue_name, id_user, queueId], (error, results) => {
        if (error) return handleDatabaseError(res, error);
        if (results.affectedRows === 0) return res.status(404).json({ message: "Queue not found" });
        res.status(200).json({ message: "Queue updated successfully" });
    });
};

// Delete a Queue
exports.delQueue = (req, res) => {
    const queueId = req.params.id;

    if (!queueId) {
        return res.status(400).json({ error: "ID is required" });
    }

    const query = "DELETE FROM pkg_queue WHERE id = ?";

    connection.query(query, [queueId], (err, result) => {
        if (err) return handleDatabaseError(res, err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Queue not found" });
        res.status(200).json({ message: "Queue deleted successfully" });
    });
};
