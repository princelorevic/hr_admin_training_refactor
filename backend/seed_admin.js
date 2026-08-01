const mysql = require('mysql2');
require('dotenv').config();

// Kukunin sa Render Environment Variables (o gagamit ng direct Aiven fallback kung sakali)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql-2c26dd62-roxasprince1422-58a1.b.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  port: process.env.DB_PORT || 13880,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to Aiven MySQL:', err);
    process.exit(1);
  }
  console.log('Successfully connected to Aiven MySQL Database!');

  // 1. Lilikha ng users table kung wala pa
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'User',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
      process.exit(1);
    }
    console.log('Users table checked/created successfully.');

    // 2. Isi-seed ang Admin account
    const seedAdminQuery = `
      INSERT INTO users (name, email, password, role) 
      VALUES ('System Admin', 'admin@manlyplastics.com', '$2b$10$BWg/cMLtO/GLbWg3TLGEM.QvKwEBK75.cLns0cgqNqz2NrqJ1ZXTa', 'Admin')
      ON DUPLICATE KEY UPDATE name=name;
    `;

    db.query(seedAdminQuery, (err) => {
      if (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
      }
      console.log('Admin user seeded successfully!');
      db.end();
      process.exit(0);
    });
  });
});