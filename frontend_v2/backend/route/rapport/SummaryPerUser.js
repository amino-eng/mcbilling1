const express = require('express');
const router = express.Router();
const { getAll, getById, add, del } = require('../../controller/rapports/SummaryMonthUser');

// Route to get all user summaries
router.get("/", getAll);

// Route to get a specific record by ID
router.get("/:id", getById);

// Route to add a new record
router.post("/", add);

// Route to delete a record by ID
router.delete("/:id", del);

module.exports = router;
