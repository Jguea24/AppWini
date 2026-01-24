const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const healthRoutes = require('./routes/health');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Wini API running on port ${port}`);
});
