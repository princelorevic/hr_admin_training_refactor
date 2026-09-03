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
  // 👉 IDINAGDAG ANG industry_assignment
  const { name, username, password, role, supervisor_id, style, google_form_url, industry_assignment } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: 'Name, username, password and role are required.' });
  }

  try {
    const roleSql = `SELECT role_id FROM roles WHERE role_name = ? LIMIT 1`;

    db.query(roleSql, [role], async (roleErr, roleResults) => {
      if (roleErr) return res.status(500).json({ error: roleErr.message });
      if (roleResults.length === 0) return res.status(400).json({ error: `Role '${role}' does not exist.` });

      const roleId = roleResults[0].role_id;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 👉 IDINAGDAG ANG industry_assignment SA SQL AT VALUES
      const insertSql = `
        INSERT INTO users (
          name, password, username, role_id, supervisor_id, style, google_form_url, industry_assignment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        name, 
        hashedPassword, 
        username, 
        roleId, 
        supervisor_id || null, 
        style || 'Not Assessed', 
        google_form_url || null,
        industry_assignment || null
      ];

      db.query(insertSql, params, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already exists.' });
          return res.status(500).json({ error: err.message });
        }

        const newUserId = result.insertId;

        if (role === 'Trainee') {
          const kpiAgentSql = `INSERT INTO kpi_agents (trainee_id, status) VALUES (?, 'Pending')`;
          db.query(kpiAgentSql, [newUserId], (kpiErr) => {
            if (kpiErr) return res.status(500).json({ error: kpiErr.message });
            res.status(201).json({ message: 'User account created successfully!', userId: newUserId });
          });
        } else {
          res.status(201).json({ message: 'User account created successfully!', userId: newUserId });
        }
      });
    });
  } catch (error) {
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

    
    const sql = `
        SELECT u.id, u.name, u.username, u.password, u.role_id, r.role_name AS role, u.supervisor_id, u.industry_assignment
        FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id
        WHERE u.username = ? LIMIT 1
    `;

    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: "Invalid username or password." });

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: "Invalid username or password." });

            res.json({
                message: "Login successful",
                user: {
                    id: user.id, 
                    username: user.username, 
                    name: user.name, 
                    role: user.role, 
                    supervisor_id: user.supervisor_id,
                    industry_assignment: user.industry_assignment 
                }
            });
        } catch (error) {
            return res.status(500).json({ error: "Login verification failed." });
        }
    });
});

// ============================================================
// API: GET ALL USERS
// ============================================================
app.get('/api/users', (req, res) => {
  
  const sql = `
    SELECT
      u.id, u.name, u.username, u.password, u.role_id, r.role_name AS role,
      u.industry_assignment, u.supervisor_id, u.style, u.google_form_url, u.created_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ============================================================
// API: GET TRAINEE KPI AGENT
// ============================================================
app.get('/api/trainee/:id/kpi-agent', (req, res) => {
    const traineeId = req.params.id;
    const sql = `SELECT * FROM kpi_agents WHERE trainee_id = ? LIMIT 1`;

    db.query(sql, [traineeId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "KPI Agent not assigned." });
        res.json(results[0]);
    });
});

// ============================================================
// API: UPDATE TRAINEE KPI AGENT
// ============================================================
app.put('/api/trainee/:id/kpi-agent', (req, res) => {
    const traineeId = req.params.id;
    const { gem_link } = req.body;

    if (!gem_link) return res.status(400).json({ error: "KPI Agent Gem link is required." });

    const sql = `UPDATE kpi_agents SET gem_link = ?, status = 'Assigned' WHERE trainee_id = ?`;

    db.query(sql, [gem_link, traineeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "KPI Agent record not found." });
        res.json({ message: "KPI Agent assigned successfully." });
    });
});

// ============================================================
// API: GET TRAINEE PROFILE
// ============================================================
app.get('/api/trainee/:id', (req, res) => {
  const traineeId = req.params.id;
  const sql = `
    SELECT u.*, r.role_name AS role
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE u.id = ? AND r.role_name = 'Trainee' LIMIT 1
  `;

  db.query(sql, [traineeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Trainee not found.' });
    res.json(results[0]);
  });
});

// ============================================================
// API: UPDATE USER
// ============================================================
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  // 👉 IDINAGDAG ANG industry_assignment
  const { name, username, password, role, supervisor_id, google_form_url, style, industry_assignment } = req.body;

  if (!name || !username || !role) {
    return res.status(400).json({ error: 'Name, username and role are required.' });
  }

  try {
    const roleSql = `SELECT role_id FROM roles WHERE role_name = ? LIMIT 1`;

    db.query(roleSql, [role], async (roleErr, roleResults) => {
      if (roleErr) return res.status(500).json({ error: roleErr.message });
      if (roleResults.length === 0) return res.status(400).json({ error: `Role '${role}' not found.` });

      const roleId = roleResults[0].role_id;
      let sql;
      let queryParams;

      // 👉 IDINAGDAG ANG industry_assignment SA UPDATE QUERIES
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = `
          UPDATE users 
          SET name = ?, username = ?, password = ?, role = ?, role_id = ?, supervisor_id = ?, style = ?, google_form_url = ?, industry_assignment = ?
          WHERE id = ?
        `;
        queryParams = [name, username, hashedPassword, role, roleId, supervisor_id || null, style || 'Not Assessed', google_form_url || null, industry_assignment || null, userId];
      } else {
        sql = `
          UPDATE users 
          SET name = ?, username = ?, role = ?, role_id = ?, supervisor_id = ?, style = ?, google_form_url = ?, industry_assignment = ?
          WHERE id = ?
        `;
        queryParams = [name, username, role, roleId, supervisor_id || null, style || 'Not Assessed', google_form_url || null, industry_assignment || null, userId];
      }

      db.query(sql, queryParams, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already exists.' });
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: 'User account updated successfully!' });
      });
    });
  } catch (error) {
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
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User permanently deleted from the database!' });
  });
});

// ============================================================
// API: ROOT
// ============================================================
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Enterprise LMS Backend API", version: "1.0.0" });
});

// ============================================================
// COURSES API
// ============================================================
app.get('/api/courses', (req, res) => {
  const sql = `SELECT course_id, title, description, status, created_by, created_at FROM courses ORDER BY course_id DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/courses', (req, res) => {
  const { title, description, created_by } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "Course title is required." });

  const sql = `INSERT INTO courses (title, description, status, created_by) VALUES (?, ?, 'Draft', ?)`;
  const params = [title.trim(), description || null, created_by || null];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Course created successfully.", courseId: result.insertId });
  });
});

// ============================================================
// SERVER INITIALIZATION
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ============================================================
// API: SUPERVISOR DASHBOARD - EMPLOYEE HANDLE METRICS
// ============================================================
app.get('/api/supervisor/:id/metrics', (req, res) => {
    const supervisorId = req.params.id;
    
    // Kunin ang total Active Trainees, at ang bilang ng Ongoing at Finished courses nila
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE supervisor_id = ?) AS active_trainees,
            (SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.user_id = u.id WHERE u.supervisor_id = ? AND e.progress < 100) AS ongoing_trainings,
            (SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.user_id = u.id WHERE u.supervisor_id = ? AND e.progress >= 100) AS finished_trainings
    `;

    db.query(sql, [supervisorId, supervisorId, supervisorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// ============================================================
// API: SUPERVISOR DASHBOARD - ENROLLED COURSES
// ============================================================
app.get('/api/supervisor/:id/enrolled', (req, res) => {
    const supervisorId = req.params.id;
    const sql = `
        SELECT c.title, e.progress, e.status 
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = ?
    `;

    db.query(sql, [supervisorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ============================================================
// API: SUPERVISOR DASHBOARD - SUGGESTED COURSES & REQUESTS
// ============================================================
app.get('/api/courses/suggested/:department', (req, res) => {
    const dept = req.params.department;
    const sql = `SELECT course_id, title, description FROM courses WHERE department_target = ? OR department_target = 'ALL' LIMIT 4`;

    db.query(sql, [dept], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/supervisor/request-enroll', (req, res) => {
    const { user_id, course_id } = req.body;
    // Ilalagay ito sa enrollments table bilang 'Pending' request
    const sql = `INSERT INTO enrollments (user_id, course_id, status, progress, date) VALUES (?, ?, 'Pending Request', 0, CURDATE())`;
    
    db.query(sql, [user_id, course_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Enrollment request submitted successfully!" });
    });
});

// ============================================================
// API: SUPERVISOR - GET ASSIGNED TRAINEES (EMPLOYEE REPORTS)
// ============================================================
app.get('/api/supervisor/:id/trainees', (req, res) => {
    const supervisorId = req.params.id;
    
    const sql = `
        SELECT 
            u.id, 
            u.name, 
            u.industry_assignment, 
            u.style, 
            k.status AS kpi_status
        FROM users u
        LEFT JOIN kpi_agents k ON u.id = k.trainee_id
        WHERE u.supervisor_id = ? AND u.role = 'Trainee'
    `;

    db.query(sql, [supervisorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});