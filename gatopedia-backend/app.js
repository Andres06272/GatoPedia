const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const breedsRouter = require('./routes/breeds');
const adminRouter = require('./routes/admin');
const crudRouter = require('./routes/crud');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Configuración middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/breeds', breedsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/crud', crudRouter);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ status: 'API working', timestamp: new Date() });
});

// Ruta para servir la página de administración
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});