const express = require("express");
const { body, param } = require("express-validator");
const { getAll, getById, add, del, getUserMonthlyStats } = require("../../controller/rapports/SummaryMonthUser");

const router = express.Router();

// Middleware to validate ID
const validateId = [
    param("id").isInt().withMessage("ID must be an integer"),
];

// Middleware to validate POST request body
const validateAdd = [
    body("id_user").isInt().withMessage("User ID must be an integer"),
    body("month").notEmpty().withMessage("Month is required"),
    body("sessiontime").isFloat().withMessage("Session time must be a number"),
    body("aloc_all_calls").isFloat().withMessage("Allocated calls must be a number"),
    body("nbcall").isInt().withMessage("Number of calls must be an integer"),
    body("nbcall_fail").isInt().withMessage("Failed calls must be an integer"),
    body("buycost").isFloat().withMessage("Buy cost must be a number"),
    body("sessionbill").isFloat().withMessage("Session bill must be a number"),
    body("lucro").isFloat().withMessage("Lucro must be a number"),
    body("asr").isFloat().withMessage("ASR must be a number"),
];

// Route to get all user summaries
router.get("/", getAll);

// Route to get a specific record by ID with validation
router.get("/:id", validateId, getById);

// Route to add a new record with validation
router.post("/", validateAdd, add);

// Route to delete a record by ID with validation
router.delete("/:id", validateId, del);

// Route to get monthly user call statistics
router.get("/stats/user-monthly-stats", getUserMonthlyStats);

module.exports = router;
