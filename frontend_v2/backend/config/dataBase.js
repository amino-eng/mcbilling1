const mysql = require("mysql2");
const config = {
  host: '213.32.34.34',
  user: 'vicidial2',
  password: 'vicidial2',
  database: 'mbilling',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool instead of single connection
const pool = mysql.createPool(config);

// Verify connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if can't connect
  } else {
    console.log('Successfully connected to database');
    connection.release();
  }
});

module.exports = pool;
