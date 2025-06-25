const Database = require('better-sqlite3');
const db = new Database('database/finance.db');

// Clear existing data (optional, be careful!)
db.exec(`
  DELETE FROM transactions;
  DELETE FROM subcategories;
  DELETE FROM categories;
  DELETE FROM months;
`);

// Step 1: Add categories
const categories = ['Income', 'Needs', 'Wants', 'Savings', 'Tithe'];
const insertCategory = db.prepare(`INSERT INTO categories (name) VALUES (?)`);
const categoryIds = categories.map(name => insertCategory.run(name).lastInsertRowid);

// Step 2: Add subcategories
const subcategoryMap = {
  Income: ['Base Pay', '401k', 'HSA'],
  Needs: ['Rent', 'Groceries', 'Fuel'],
  Wants: ['Dining Out', 'Entertainment'],
  Savings: ['Emergency Fund', 'Investments'],
  Tithe: ['Church']
};

const insertSubcategory = db.prepare(`
  INSERT INTO subcategories (category_id, name) VALUES (?, ?)
`);

let subcategoryIds = [];

for (let i = 0; i < categories.length; i++) {
  const catId = categoryIds[i];
  const subs = subcategoryMap[categories[i]];
  for (const name of subs) {
    const id = insertSubcategory.run(catId, name).lastInsertRowid;
    subcategoryIds.push(id);
  }
}

// Step 3: Add months
const insertMonth = db.prepare(`
  INSERT INTO months (year, month, label) VALUES (?, ?, ?)
`);

const months = [
  { year: 2024, month: 12 },
  { year: 2025, month: 1 },
  { year: 2025, month: 2 }
];

const monthIds = months.map(({ year, month }) => {
  const label = `${monthName(month)}`;
  return insertMonth.run(year, month, label).lastInsertRowid;
});

// Step 4: Add transactions with fake values
const insertTransaction = db.prepare(`
  INSERT INTO transactions (month_id, subcategory_id, expected, actual)
  VALUES (?, ?, ?, ?)
`);

for (const monthId of monthIds) {
  for (const subcatId of subcategoryIds) {
    const expected = randomAmount();
    const actual = expected + (Math.random() * 50 - 25); // +/- $25 variance
    insertTransaction.run(monthId, subcatId, expected.toFixed(2), actual.toFixed(2));
  }
}

// Helpers
function randomAmount() {
  return Math.floor(Math.random() * 500) + 50;
}

function monthName(m) {
  return new Date(0, m - 1).toLocaleString('default', { month: 'long' });
}

console.log('✅ Fake data seeded!');
