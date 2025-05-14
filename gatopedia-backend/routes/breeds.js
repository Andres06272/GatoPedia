const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Obtener todas las razas con filtros
router.get('/', (req, res) => {
  const { search, color, pattern } = req.query;
  
  let sql = `
    SELECT b.* 
    FROM breeds b
    WHERE 1=1
  `;
  let params = [];

  if (search) {
    sql += ` AND (b.name LIKE ? OR b.characteristics LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (color) {
    const colors = color.split(',');
    sql += ` AND EXISTS (
      SELECT 1 FROM attributes a 
      WHERE a.breed_id = b.id AND a.type = 'color' AND a.value IN (${colors.map(() => '?').join(',')})
    )`;
    params.push(...colors);
  }

  if (pattern) {
    const patterns = pattern.split(',');
    sql += ` AND EXISTS (
      SELECT 1 FROM attributes a 
      WHERE a.breed_id = b.id AND a.type = 'pattern' AND a.value IN (${patterns.map(() => '?').join(',')})
    )`;
    params.push(...patterns);
  }

  db.all(sql, params, (err, breeds) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const getAttributes = (breed) => {
      return new Promise((resolve) => {
        db.all(
          `SELECT type, value FROM attributes WHERE breed_id = ?`,
          [breed.id],
          (err, attributes) => {
            const result = {
              ...breed,
              colors: attributes.filter(a => a.type === 'color').map(a => a.value),
              patterns: attributes.filter(a => a.type === 'pattern').map(a => a.value),
              tags: attributes.filter(a => a.type === 'tag').map(a => a.value)
            };
            resolve(result);
          }
        );
      });
    };

    Promise.all(breeds.map(getAttributes))
      .then(results => res.json(results))
      .catch(error => res.status(500).json({ error }));
  });
});

// Obtener detalles de una raza específica
router.get('/:id', (req, res) => {
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

module.exports = router;