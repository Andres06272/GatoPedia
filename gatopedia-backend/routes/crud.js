const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { isAdmin } = require('../middleware/auth');

// Obtener una raza por ID
router.get('/breeds/:id', isAdmin, (req, res) => {
    const { id } = req.params;

    db.get(
        `SELECT * FROM breeds WHERE id = ?`,
        [id],
        (err, breed) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!breed) {
                return res.status(404).json({ error: 'Raza no encontrada' });
            }

            db.all(
                `SELECT type, value FROM attributes WHERE breed_id = ?`,
                [id],
                (err, attributes) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    const result = {
                        ...breed,
                        colors: attributes.filter(a => a.type === 'color').map(a => a.value),
                        patterns: attributes.filter(a => a.type === 'pattern').map(a => a.value),
                        tags: attributes.filter(a => a.type === 'tag').map(a => a.value)
                    };
                    res.json(result);
                }
            );
        }
    );
});

// Obtener todas las razas
router.get('/breeds', isAdmin, (req, res) => {
    db.all(`SELECT * FROM breeds`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Crear una o varias razas
router.post('/breeds', isAdmin, (req, res) => {
    const breeds = Array.isArray(req.body) ? req.body : [req.body]; // Aceptar un solo objeto o un array
    const errors = [];

    breeds.forEach((breed, index) => {
        const { name, lifespan, characteristics, origin, weight, image, attributes } = breed;

        // Validar campos obligatorios
        if (!name || !lifespan || !characteristics || !origin || !weight || !image) {
            errors.push({ index, error: 'Todos los campos obligatorios deben estar completos.' });
            return;
        }

        db.run(
            `INSERT INTO breeds (name, lifespan, characteristics, origin, weight, image) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, lifespan, characteristics, origin, weight, image],
            function(err) {
                if (err) {
                    errors.push({ index, error: err.message });
                    return;
                }

                const breedId = this.lastID;

                // Insertar atributos adicionales (colores, patrones, etiquetas)
                if (attributes && attributes.length > 0) {
                    attributes.forEach(attr => {
                        db.run(
                            `INSERT INTO attributes (breed_id, type, value) VALUES (?, ?, ?)`,
                            [breedId, attr.type, attr.value]
                        );
                    });
                }
            }
        );
    });

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Algunas razas no se pudieron insertar.', errors });
    }

    res.status(201).json({ message: 'Razas creadas exitosamente.' });
});

// Actualizar una raza
router.put('/breeds/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, lifespan, characteristics, origin, weight, image, attributes } = req.body;

    db.run(
        `UPDATE breeds SET name = ?, lifespan = ?, characteristics = ?, origin = ?, weight = ?, image = ? WHERE id = ?`,
        [name, lifespan, characteristics, origin, weight, image, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Eliminar los atributos existentes para esta raza
            db.run(`DELETE FROM attributes WHERE breed_id = ?`, [id], function(err) {
                if (err) return res.status(500).json({ error: err.message });

                // Insertar los nuevos atributos
                if (attributes && attributes.length > 0) {
                    attributes.forEach(attr => {
                        db.run(
                            `INSERT INTO attributes (breed_id, type, value) VALUES (?, ?, ?)`,
                            [id, attr.type, attr.value]
                        );
                    });
                }

                res.json({ message: 'Raza actualizada' });
            });
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