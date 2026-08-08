const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ============================================================
// DATABASE CONNECTION
// ============================================================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL Database: ' + process.env.DB_NAME);
});

// ============================================================
// API: CREATE USER
// ============================================================
app.post('/api/users', async (req, res) => {
  const { name, username, password, role, supervisor_id } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: 'Name, username, password and role are required.' });
  }

  try {
    // GET ROLE ID FROM ROLES TABLE
    const roleSql = `SELECT role_id FROM roles WHERE role_name = ? LIMIT 1`;
    
    db.query(roleSql, [role], async (roleErr, roleResults) => {
      if (roleErr) {
        console.error("Role lookup error:", roleErr);
        return res.status(500).json({ error: roleErr.message });
      }

      if (roleResults.length === 0) {
        return res.status(400).json({ error: `Role '${role}' not found.` });
      }

      const roleId = roleResults[0].role_id;
      const hashedPassword = await bcrypt.hash(password, 10);

      // CREATE USER
      const insertUserSql = `
        INSERT INTO users (name, password, role, username, role_id, supervisor_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const queryParams = [name, hashedPassword, role, username, roleId, supervisor_id || null];

      db.query(insertUserSql, queryParams, (err, result) => {
        if (err) {
          console.error("Create user error:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists.' });
          }
          return res.status(500).json({ error: err.message });
        }

        const newUserId = result.insertId;

        // CREATE KPI AGENT FOR TRAINEE
        if (role === 'Trainee') {
          const insertKpiSql = `INSERT INTO kpi_agents (trainee_id) VALUES (?)`;
          db.query(insertKpiSql, [newUserId], (kpiErr) => {
            if (kpiErr) {
              console.error("Failed to generate KPI Agent:", kpiErr);
              return res.status(201).json({
                message: 'User created, but KPI Agent provisioning failed.',
                userId: newUserId
              });
            }
            return res.status(201).json({
              message: 'Trainee account created and KPI Agent successfully provisioned!',
              userId: newUserId
            });
          });
        } else {
          return res.status(201).json({
            message: 'User account created successfully!',
            userId: newUserId
          });
        }
      });
    });
  } catch (error) {
    console.error("Create user exception:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================
// API: LOGIN
// ============================================================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  console.log("Username received:", username);

  const sql = `
    SELECT u.id, u.name, u.username, u.password, u.role_id, r.role_name, u.supervisor_id
    FROM users u
    INNER JOIN roles r ON u.role_id = r.role_id
    WHERE u.username = ? LIMIT 1
  `;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Login database error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role_name,
          supervisor_id: user.supervisor_id
        }
      });
    } catch (error) {
      console.error("Password verification error:", error);
      return res.status(500).json({ error: "Login verification failed." });
    }
  });
});

// ============================================================
// API: GET ALL USERS
// ============================================================
app.get('/api/users', (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.username, u.role_id, r.role_name AS role, u.supervisor_id, u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error loading users:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ============================================================
// API: GET SUPERVISORS
// ============================================================
app.get('/api/users/supervisors', (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.username, u.role_id, r.role_name
    FROM users u
    INNER JOIN roles r ON u.role_id = r.role_id
    WHERE r.role_name = 'Supervisor'
    ORDER BY u.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error loading supervisors:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ============================================================
// API: GET TRAINEE PROFILE
// ============================================================
app.get('/api/trainee/:id', (req, res) => {
  const traineeId = req.params.id;

  const sql = `
    SELECT u.id, u.name, u.username, u.role_id, r.role_name AS role, u.supervisor_id, u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE u.id = ? AND r.role_name = 'Trainee'
    LIMIT 1
  `;

  db.query(sql, [traineeId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Trainee not found.' });
    }
    res.json(results[0]);
  });
});

// ============================================================
// API: UPDATE USER
// ============================================================
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, username, password, role, supervisor_id } = req.body;

  if (!name || !username || !role) {
    return res.status(400).json({ error: 'Name, username and role are required.' });
  }

  try {
    const roleSql = `SELECT role_id FROM roles WHERE role_name = ? LIMIT 1`;

    db.query(roleSql, [role], async (roleErr, roleResults) => {
      if (roleErr) {
        return res.status(500).json({ error: roleErr.message });
      }
      if (roleResults.length === 0) {
        return res.status(400).json({ error: `Role '${role}' not found.` });
      }

      const roleId = roleResults[0].role_id;
      let sql;
      let queryParams;

      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = `
          UPDATE users 
          SET name = ?, username = ?, password = ?, role = ?, role_id = ?, supervisor_id = ?
          WHERE id = ?
        `;
        queryParams = [name, username, hashedPassword, role, roleId, supervisor_id || null, userId];
      } else {
        sql = `
          UPDATE users 
          SET name = ?, username = ?, role = ?, role_id = ?, supervisor_id = ?
          WHERE id = ?
        `;
        queryParams = [name, username, role, roleId, supervisor_id || null, userId];
      }

      db.query(sql, queryParams, (err, result) => {
        if (err) {
          console.error("Update user error:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists.' });
          }
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ message: 'User account updated successfully!' });
      });
    });
  } catch (error) {
    console.error("Update user exception:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================
// API: DELETE USER
// ============================================================
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = `DELETE FROM users WHERE id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User permanently deleted from the database!' });
  });
});

// ============================================================
// API: ROOT
// ============================================================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Enterprise LMS Backend API",
    version: "1.0.0"
  });
});

// ============================================================
// SERVER INITIALIZATION
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});