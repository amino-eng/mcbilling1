const express = require('express');
const mysql = require('mysql2');
const cors =require ("cors")
const app = express();
const port = 5000;
const {connect} = require("./config/dataBase")
const routeClient=require("./route/client")
const routeCDR=require("./route/rapport/CDRroute")
const routeSummaryPerDay=require("./route/rapport/SummaryPerDay")

// cors
app.use(cors())

app.use(express.json())
// Simple route to query the database
app.use("/api/admin/agent",routeClient)
app.use("/api/admin/CDR",routeCDR)
app.use("/api/admin/SummaryPerDay",routeSummaryPerDay)

// Start the server
app.listen(port, () => {
  console.log("Server is running on",port );
});