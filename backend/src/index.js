const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(process.env.DB_PATH || ':memory:');

// Initialize DB
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT,
    address TEXT,
    systemSize TEXT,
    preferredInstallDate TEXT
  )`);
});

// POST /jobs
app.post('/jobs', (req, res) => {
    const { clientName, address, systemSize, preferredInstallDate } = req.body;
    db.run(
        `INSERT INTO jobs (clientName, address, systemSize, preferredInstallDate) VALUES (?, ?, ?, ?)`,
        [clientName, address, systemSize, preferredInstallDate],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.status(201).json({ id: this.lastID });
        }
    );
});

// GET /jobs
app.get('/jobs', (req, res) => {
    db.all(`SELECT * FROM jobs`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));