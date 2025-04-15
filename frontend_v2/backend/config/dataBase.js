
const mysql =require("mysql2")
// Database connection configuration
  
    const connection = mysql.createConnection({
        host: '213.32.34.34',  
        user: 'vicidial2',      
        password: 'vicidial2', 
        database: 'mbilling',   
        port:3306
           
      });
    
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err.stack);
          return;
        }
        console.log('Connected to the database');
      });
    
module.exports =connection
