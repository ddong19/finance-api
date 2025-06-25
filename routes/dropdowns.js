const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const db = new Database('database/finance.db');

// GET /api/years
router.get('/years', (req, res) => {
    const years = db.prepare('SELECT DISTINCT year FROM months ORDER BY year DESC').all();
    res.json(years.map(row => row.year));
});

// GET /api/months/:year
router.get('/months/:year', (req, res) => {
    const year = parseInt(req.params.year);
    const months = db.prepare('SELECT DISTINCT label FROM months WHERE year = ? ORDER BY month').all(year);
    res.json(months.map(row => row.label));
});

module.exports = router;
