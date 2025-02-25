
const mysql =require("mysql2")
// Database connection configuration


        
    const connection = mysql.createConnection({
        host: '213.32.34.34',       // Replace with your database IP
        user: 'vicidial2',      // Replace with your database username
        password: 'vicidial2',  // Replace with your database password
        database: 'mbilling',       // Replace with your database name
      });
    
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err.stack);
          return;
        }
        console.log('Connected to the database');
      });
    
module.exports =connection
