// backend/seed_admin.js
const mysql = require('mysql2'); // o 'mysql2' kung iyon ang gamit mo
const bcrypt = require('bcrypt'); // o 'bcryptjs'

// 1. Ilagay ang iyong MySQL Database credentials dito
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         
    password: 'Roxas032920',         
    database: 'lms_database'    
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');

    // 2. Ang mga detalye ng iyong Super Admin
    const adminName = 'System Admin';
    const adminEmail = 'admin@manlyplastics.com';
    const adminPassword = 'adminpassword123'; // Ito ang gagamitin mo pang-login
    const adminRole = 'Admin';

    // 3. I-hash ang password bago i-save
    bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (err) throw err;

        // 4. I-insert sa database (Siguraduhing tama ang table name, hal. 'users')
        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        
        db.query(sql, [adminName, adminEmail, hash, adminRole], (err, result) => {
            if (err) {
                console.error('Error inserting admin:', err);
            } else {
                console.log('✅ Success! Admin account created.');
                console.log(`Email: ${adminEmail}`);
                console.log(`Password: ${adminPassword}`);
            }
            process.exit(); // I-close ang script
        });
    });
});