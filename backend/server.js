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

  // Basic validation
  if (!name || !username || !password || !role) {
    return res.status(400).json({
      error: 'Name, username, password and role are required.'
    });
  }

  try {
    // ------------------------------------------------
    // 1. FIND ROLE ID
    // ------------------------------------------------
    const roleSql = `
      SELECT role_id
      FROM roles
      WHERE role_name = ?
      LIMIT 1
    `;

    db.query(roleSql, [role], async (roleErr, roleResults) => {
      if (roleErr) {
        console.error("Role lookup error:", roleErr);
        return res.status(500).json({ error: roleErr.message });
      }

      if (roleResults.length === 0) {
        return res.status(400).json({ error: `Role '${role}' does not exist.` });
      }

      const roleId = roleResults[0].role_id;
      const hashedPassword = await bcrypt.hash(password, 10);


      const insertSql = `
        INSERT INTO users (
          name,  password, username, role_id, supervisor_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const params = [
        name,
        hashedPassword,
        username,
        roleId,
        supervisor_id || null
      ];

      db.query(insertSql, params, (err, result) => {
        if (err) {
          console.error("Create user error:", err);

          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
              error: 'Username already exists.'
            });
          }

          return res.status(500).json({ error: err.message });
        }

        const newUserId = result.insertId;
console.log(`User created successfully: ${name} (ID: ${newUserId})`);

// ------------------------------------------------
// 5. CREATE KPI AGENT RECORD FOR TRAINEE
// ------------------------------------------------
if (role === 'Trainee') {
  const kpiAgentSql = `
    INSERT INTO kpi_agents (
      trainee_id,
      status
    ) VALUES (?, 'Pending')
  `;

  db.query(kpiAgentSql, [newUserId], (kpiErr) => {
    if (kpiErr) {
      console.error("KPI Agent creation error:", kpiErr);
      return res.status(500).json({
        error: kpiErr.message
      });
    }

    console.log(`KPI Agent created for trainee ID: ${newUserId}`);

    res.status(201).json({
      message: 'User account created successfully!',
      userId: newUserId
    });
  });

} else {
  res.status(201).json({
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
        return res.status(400).json({
            error: 'Username and password are required.'
        });
    }

    console.log("====================================");
    console.log("LOGIN ATTEMPT");
    console.log("Username received:", username);
    console.log("Password received:", password ? "[RECEIVED]" : "[EMPTY]");


    const sql = `
        SELECT 
            u.id,
            u.name,
            u.username,
            u.password,
            u.role_id,
            r.role_name,
            u.supervisor_id
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.role_id
        WHERE u.username = ?
        LIMIT 1
    `;


    db.query(sql, [username], async (err, results) => {

        if (err) {

            console.error("Login database error:", err);

            return res.status(500).json({
                error: err.message
            });

        }


        console.log("User records found:", results.length);


        if (results.length === 0) {

            console.log("LOGIN FAILED: Username not found.");

            return res.status(401).json({
                error: "Invalid username or password."
            });

        }


        const user = results[0];

        console.log("User ID:", user.id);
        console.log("Username from DB:", user.username);
        console.log("Role ID:", user.role_id);
        console.log("Role:", user.role_name);
        console.log("Password hash exists:", !!user.password);


        try {

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );


            console.log("Password match:", isMatch);


            if (!isMatch) {

                console.log("LOGIN FAILED: Password mismatch.");

                return res.status(401).json({
                    error: "Invalid username or password."
                });

            }


            console.log("LOGIN SUCCESS");


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

            console.error(
                "Password verification error:",
                error
            );

            return res.status(500).json({
                error: "Login verification failed."
            });

        }

    });

});

// ============================================================
// API: GET ALL USERS
// ============================================================
app.get('/api/users', (req, res) => {

  const sql = `
    SELECT
      u.id,
      u.name,
      u.username,
      u.password,
      u.role_id,
      r.role_name AS role,
      u.industry_assignment,
      u.supervisor_id,
      u.created_at
    FROM users u
    INNER JOIN roles r
      ON u.role_id = r.role_id
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error("Error fetching users:", err);

      return res.status(500).json({
        error: err.message
      });
    }

    res.json(results);
  });
});

/// ============================================================
// API: GET TRAINEE KPI AGENT
// ============================================================
app.get('/api/trainee/:id/kpi-agent', (req, res) => {
    const traineeId = req.params.id;

    const sql = `
        SELECT
            kpi_agent_id,
            trainee_id,
            gem_link,
            status,
            created_at,
            updated_at
        FROM kpi_agents
        WHERE trainee_id = ?
        LIMIT 1
    `;

    db.query(sql, [traineeId], (err, results) => {
        if (err) {
            console.error("Error loading KPI Agent:", err);
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: "KPI Agent not assigned."
            });
        }

        res.json(results[0]);
    });
});


// ============================================================
// API: UPDATE TRAINEE KPI AGENT
// ============================================================
app.put('/api/trainee/:id/kpi-agent', (req, res) => {
    const traineeId = req.params.id;
    const { gem_link } = req.body;

    if (!gem_link) {
        return res.status(400).json({
            error: "KPI Agent Gem link is required."
        });
    }

    const sql = `
        UPDATE kpi_agents
        SET
            gem_link = ?,
            status = 'Assigned'
        WHERE trainee_id = ?
    `;

    db.query(sql, [gem_link, traineeId], (err, result) => {
        if (err) {
            console.error("Error updating KPI Agent:", err);
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "KPI Agent record not found."
            });
        }

        res.json({
            message: "KPI Agent assigned successfully."
        });
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
  const { name, username, password, role, supervisor_id, google_form_url } = req.body;

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
        // FIX #2: Idinagdag ang google_form_url = ? sa SET clause
        sql = `
          UPDATE users 
          SET name = ?, username = ?, password = ?, role = ?, role_id = ?, supervisor_id = ?, google_form_url = ?
          WHERE id = ?
        `;
        queryParams = [name, username, hashedPassword, role, roleId, supervisor_id || null, google_form_url || null, userId];
      } else {
        sql = `
          UPDATE users 
          SET name = ?, username = ?, role = ?, role_id = ?, supervisor_id = ?, google_form_url = ?
          WHERE id = ?
        `;
        queryParams = [name, username, role, roleId, supervisor_id || null, google_form_url || null, userId];
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
// COURSES API
// ============================================================

// GET ALL COURSES
app.get('/api/courses', (req, res) => {
  const sql = `
    SELECT course_id, title, description, status, created_by, created_at
    FROM courses
    ORDER BY course_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error loading courses:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// CREATE COURSE
app.post('/api/courses', (req, res) => {
  const { title, description, created_by } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Course title is required." });
  }

  const sql = `
    INSERT INTO courses (title, description, status, created_by)
    VALUES (?, ?, 'Draft', ?)
  `;

  const params = [
    title.trim(),
    description || null,
    created_by || null
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error creating course:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Course created successfully.",
      courseId: result.insertId
    });
  });
});

// ============================================================
// SERVER INITIALIZATION
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});