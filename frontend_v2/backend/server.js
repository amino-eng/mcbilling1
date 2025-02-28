const express = require('express');
const mysql = require('mysql2');
const cors =require ("cors")
const app = express();
const port = 5000;
const {connect} = require("./config/dataBase");
const routeClient=require("./route/client");
const routeCDR=require("./route/rapport/CDRroute");
const routeSummaryPerDay=require("./route/rapport/SummaryPerDay");
const routeSummaryPerMonth=require("./route/rapport/SummaryPerMonth");
const routeCDRFailed = require("./route/rapport/CDRFailed");
const routedashboard = require("./route/dashboard/dashboard");


// cors
app.use(cors())

app.use(express.json())
// Simple route to query the database
app.use("/api/admin/agent",routeClient)
app.use("/api/admin/CDR",routeCDR)
app.use("/api/admin/SummaryPerDay",routeSummaryPerDay)
app.use("/api/admin/SummaryPerMonth",routeSummaryPerMonth)
app.use("/api/admin/CdrFailed", routeCDRFailed);
app.use("/api/admin/dashboard", routedashboard);
app.use(cors());

// Start the server
app.listen(port, () => {
  console.log("Server is running on",port );
});