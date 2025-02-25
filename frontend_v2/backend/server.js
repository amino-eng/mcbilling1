const express = require('express');
const mysql = require('mysql2');
const cors =require ("cors")
const app = express();
const port = 5000;

// Database connection configuration
const connection = mysql.createConnection({
  host: '213.32.34.34',       // Replace with your database IP
  user: 'vicidial2',      // Replace with your database username
  password: 'vicidial2',  // Replace with your database password
  database: 'mbilling',       // Replace with your database name
});


// cors
app.use(cors())

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Simple route to query the database
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM pkg_restrict_phone LIMIT 10'; // Replace with your table name
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      res.status(500).send('Error querying the database');
      return;
    }
    console.log('Query results:', results);
    res.json(results); // Send results as JSON response
  });
});

// Start the server
app.listen(port, () => {
  console.log("Server is running on" );
});