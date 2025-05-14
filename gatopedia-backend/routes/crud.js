const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { isAdmin } = require('../middleware/auth');

// Obtener todas las razas
router.get('/breeds', isAdmin, (req, res) => {
    db.all('SELECT * FROM breeds', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Crear una nueva raza
router.post('/breeds', isAdmin, (req, res) => {
    const { name, lifespan, characteristics, origin, weight, image } = req.body;
    db.run(
        `INSERT INTO breeds (name, lifespan, characteristics, origin, weight, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, lifespan, characteristics, origin, weight, image],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Actualizar una raza
router.put('/breeds/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, lifespan, characteristics, origin, weight, image } = req.body;
    db.run(
        `UPDATE breeds SET name = ?, lifespan = ?, characteristics = ?, origin = ?, weight = ?, image = ? WHERE id = ?`,
        [name, lifespan, characteristics, origin, weight, image, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Raza actualizada' });
        }
    );
});

// Eliminar una raza
router.delete('/breeds/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM breeds WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Raza eliminada' });
    });
});

module.exports = router;