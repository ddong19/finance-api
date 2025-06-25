const Database = require('better-sqlite3');

const db = new Database('./database/finance.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS months (
    id INTEGER PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    label TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY,
    category_id INTEGER,
    name TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    month_id INTEGER,
    subcategory_id INTEGER,
    expected DECIMAL,
    actual DECIMAL,
    FOREIGN KEY (month_id) REFERENCES months(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
  );
`);

console.log('Database initialized.');
