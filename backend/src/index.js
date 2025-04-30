const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(process.env.DB_PATH || ':memory:');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT,
    address TEXT,
    systemSize TEXT,
    preferredInstallDate TEXT
  )`);
});


const USER = {
    username: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10),
};


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('Missing token');

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
}


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username !== USER.username || !bcrypt.compareSync(password, USER.passwordHash)) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
});


app.post('/jobs', authenticateToken, (req, res) => {
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


app.get('/jobs', (req, res) => {
    db.all(`SELECT * FROM jobs`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

app.delete('/jobs/:id', authenticateToken, (req, res) => {
    const jobId = req.params.id;
    db.run(`DELETE FROM jobs WHERE id = ?`, [jobId], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('Job not found');
        res.sendStatus(204);
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));