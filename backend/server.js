require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized
    }
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database: ' + process.env.DB_NAME);
});

// --- API: CREATE USER ---
app.post('/api/users', async (req, res) => {
    const { name, email, password, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const insertUserSql = `
            INSERT INTO users 
            (name, email, password, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(insertUserSql, [name, email, hashedPassword, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered.' });
                return res.status(500).json({ error: err.message });
            }

            const newUserId = result.insertId;

            if (role === 'Trainee') {
                const insertKpiSql = `INSERT INTO kpi_agents (trainee_id) VALUES (?)`;
                db.query(insertKpiSql, [newUserId], (kpiErr) => {
                    if (kpiErr) {
                        console.error("Failed to generate KPI Agent: ", kpiErr);
                        return res.status(201).json({ message: 'User created, but KPI Agent provisioning failed.', userId: newUserId });
                    }
                    return res.status(201).json({ message: 'Trainee account created and KPI Agent successfully provisioned!', userId: newUserId });
                });
            } else {
                return res.status(201).json({ message: 'User account created successfully!', userId: newUserId });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- API: LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

        res.json({ 
            message: 'Login successful', 
            user: { id: user.id, name: user.name, role: user.role }
        });
    });
});

// --- API: GET ALL USERS ---
app.get('/api/users', (req, res) => {
    const sql = `
        SELECT id, name, email, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link, created_at 
        FROM users
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    }); 
});

// --- API: GET TRAINEE PROFILE ---
app.get('/api/trainee/:id', (req, res) => {
    const traineeId = req.params.id;
    const sql = `
        SELECT id, name, email, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link, created_at 
        FROM users 
        WHERE id = ? AND role = 'Trainee'
    `;
                 
    db.query(sql, [traineeId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Trainee not found.' });
        
        res.json(results[0]);
    });
});

// --- API: UPDATE USER ---
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, password, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link } = req.body;
    
    try {
        let sql;
        let queryParams;

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = `
                UPDATE users 
                SET name = ?, email = ?, password = ?, role = ?, supervisor_id = ?, product_assignment = ?, industry_assignment = ?, style = ?, assessment_link = ? 
                WHERE id = ?
            `;
            queryParams = [name, email, hashedPassword, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link, userId];
        } else {
            sql = `
                UPDATE users 
                SET name = ?, email = ?, role = ?, supervisor_id = ?, product_assignment = ?, industry_assignment = ?, style = ?, assessment_link = ? 
                WHERE id = ?
            `;
            queryParams = [name, email, role, supervisor_id, product_assignment, industry_assignment, style, assessment_link, userId];
        }
        
        db.query(sql, queryParams, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User account updated successfully!' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- API: DELETE USER ---
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM users WHERE id = ?`;
    
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
        
        res.json({ message: 'User permanently deleted from the database!' });
    });
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});