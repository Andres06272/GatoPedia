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
                `SELECT type, value, label FROM attributes WHERE breed_id = ?`,
                [id],
                (err, attributes) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    const result = {
                        ...breed,
                        colors: attributes.filter(a => a.type === 'color').map(a => a.value),
                        patterns: attributes.filter(a => a.type === 'pattern').map(a => a.value),
                        tags: attributes.filter(a => a.type === 'tag').map(a => a.value),
                        links: attributes
                            .filter(a => a.type === 'link')
                            .map(a => ({
                                url: a.value,
                                label: a.label || a.value
                            }))
                    };
                    res.json(result);
                }
            );
        }
    );
});

// Obtener todas las razas (con links básicos)
router.get('/breeds', isAdmin, (req, res) => {
    db.all(`SELECT * FROM breeds`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Para cada raza, obtener links asociados
        const breedIds = rows.map(r => r.id);
        if (breedIds.length === 0) return res.json(rows);

        db.all(
            `SELECT breed_id, value, label FROM attributes WHERE type = 'link' AND breed_id IN (${breedIds.map(() => '?').join(',')})`,
            breedIds,
            (err, links) => {
                if (err) return res.status(500).json({ error: err.message });
                const linksByBreed = {};
                links.forEach(l => {
                    if (!linksByBreed[l.breed_id]) linksByBreed[l.breed_id] = [];
                    linksByBreed[l.breed_id].push({ url: l.value, label: l.label || l.value });
                });
                const result = rows.map(breed => ({
                    ...breed,
                    links: linksByBreed[breed.id] || []
                }));
                res.json(result);
            }
        );
    });
});

// Crear una o varias razas
router.post('/breeds', isAdmin, (req, res) => {
    const breeds = Array.isArray(req.body) ? req.body : [req.body]; // Aceptar un solo objeto o un array
    const errors = [];

    breeds.forEach((breed, index) => {
        const { name, lifespan, characteristics, origin, weight, image, attributes, links } = breed;

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
                            `INSERT INTO attributes (breed_id, type, value, label) VALUES (?, ?, ?, ?)`,
                            [breedId, attr.type, attr.value, attr.label || null]
                        );
                    });
                }
                // Insertar links si vienen en el body
                if (links && links.length > 0) {
                    links.forEach(link => {
                        db.run(
                            `INSERT INTO attributes (breed_id, type, value, label) VALUES (?, 'link', ?, ?)`,
                            [breedId, link.url, link.label || null]
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
    const { name, lifespan, characteristics, origin, weight, image, attributes, links } = req.body;

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
                            `INSERT INTO attributes (breed_id, type, value, label) VALUES (?, ?, ?, ?)`,
                            [id, attr.type, attr.value, attr.label || null]
                        );
                    });
                }
                // Insertar links si vienen en el body
                if (links && links.length > 0) {
                    links.forEach(link => {
                        db.run(
                            `INSERT INTO attributes (breed_id, type, value, label) VALUES (?, 'link', ?, ?)`,
                            [id, link.url, link.label || null]
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