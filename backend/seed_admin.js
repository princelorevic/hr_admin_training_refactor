const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Naka-hardcode na mismo dito para hindi na mag-rely sa terminal
const db = mysql.createConnection({
  host: 'mysql-2c26dd62-roxasprince1422-58a1.b.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_Fa37zmAqoiScNtUSoqR',
  database: 'defaultdb',
  port: 13880,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  const plainPassword = 'adminpassword123';
  const adminEmail = 'admin@manlyplastics.com';

  bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Hashing error:', err);
      process.exit(1);
    }

    const seedQuery = `
      INSERT INTO users (name, email, password, role) 
      VALUES ('System Admin', '${adminEmail}', '${hashedPassword}', 'Admin')
      ON DUPLICATE KEY UPDATE password='${hashedPassword}';
    `;

    db.query(seedQuery, (err) => {
      if (err) {
        console.error('Seed error:', err);
        process.exit(1);
      }
      console.log(' SUCCESS! Admin password updated to: adminpassword123');
      db.end();
      process.exit(0);
    });
  });
});