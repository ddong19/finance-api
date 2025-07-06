const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const db = new Database('database/finance.db');

// GET /api/categories
router.get('/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();

    const subcategoryStmt = db.prepare('SELECT id, name FROM subcategories WHERE category_id = ?');

    const result = categories.map(category => ({
        id: category.id,
        name: category.name,
        subcategories: subcategoryStmt.all(category.id)
    }));

    res.json(result);
});

module.exports = router;