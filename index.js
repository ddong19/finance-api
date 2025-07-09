const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Finance API is running 🎉');
});

const dropdownRoutes = require('./routes/dropdowns');
const categoriesRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');

app.use('/api', dropdownRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', transactionRoutes)

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});