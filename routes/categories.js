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

// POST /api/subcategories
router.post('/subcategories', (req, res) => {
    const { categoryId, name } = req.body;

    if (!categoryId || !name) {
        return res.status(400).json({ error: "categoryId and name are required." });
    }

    try {
        const categoryExists = db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ error: "Category not found." });
        }

        const insertStmt = db.prepare('INSERT INTO subcategories (name, category_id) VALUES (?, ?)');
        const result = insertStmt.run(name, categoryId);

        res.status(201).json({
            message: 'Subcategory created successfully.',
            subcategory: {
                id: result.lastInsertRowid,
                name,
                categoryId
            }
        });
    } catch (error) {
        console.error("Error inserting subcategory:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// DELETE /api/subcategories/:id
router.delete('/subcategories/:id', (req, res) => {
    const subcategoryId = parseInt(req.params.id)

    try {
        const subcat = db.prepare('SELECT id, name FROM subcategories WHERE id = ?').get(subcategoryId);
        if (!subcat) {
            return res.status(404).json({ error: "Subcategory not found." });
        }

        const { count } = db.prepare('SELECT COUNT(*) AS count FROM transactions WHERE subcategory_id = ?').get(subcategoryId);
  
        if (count > 0) {
            return res.status(409).json({
            error: "Cannot delete subcategory; it is used in transaction records.",
            });
        }

        const del = db.prepare('DELETE FROM subcategories WHERE id = ?').run(subcategoryId);

        return res.status(200).json({
            message: "Subcategory deleted successfully.",
            subcategoryId,
        });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;