const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const db = new Database('database/finance.db');

// GET /api/transactions/:year/:month
router.get('/transactions/:year/:month', (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Get the corresponding month_id
    const monthRow = db.prepare(
        'SELECT id FROM months WHERE year = ? AND month = ?'
    ).get(year, month);

    if (!monthRow) {
        return res.status(404).json({ error: 'Month not found' });
    }

    const monthId = monthRow.id;

    const rows = db.prepare(`
        SELECT 
            c.id AS categoryId,
            c.name AS categoryName,
            sc.id AS subcategoryId,
            sc.name AS subcategoryName,
            t.expected,
            t.actual
        FROM transactions t
        JOIN subcategories sc ON t.subcategory_id = sc.id
        JOIN categories c ON sc.category_id = c.id
        WHERE t.month_id = ?
        ORDER BY c.name, sc.name
    `).all(monthId);

    // Group by category
    const grouped = {};
    for (const row of rows) {
        if (!grouped[row.categoryId]) {
            grouped[row.categoryId] = {
                categoryId: row.categoryId,
                categoryName: row.categoryName,
                subcategories: []
            };
        }

        grouped[row.categoryId].subcategories.push({
            subcategoryId: row.subcategoryId,
            subcategoryName: row.subcategoryName,
            expected: row.expected,
            actual: row.actual
        });
    }

    res.json(Object.values(grouped));
});


module.exports = router;