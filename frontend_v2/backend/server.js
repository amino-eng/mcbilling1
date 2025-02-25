const express = require('express');
const mysql = require('mysql2');
const cors =require ("cors")
const app = express();
const port = 5000;
const {connect} = require("./config/dataBase")
const routeClient=require("./route/client")

// cors
app.use(cors())


// Simple route to query the database
app.use("/api/admin/agent",routeClient)

// Start the server
app.listen(port, () => {
  console.log("Server is running on",port );
});