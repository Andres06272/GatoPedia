const express = require('express');
const router = express.Router();

// Credenciales preestablecidas
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '1234' // Cambia esto por una contraseña segura
};

// Endpoint para manejar el inicio de sesión
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Guardar sesión en cookies (opcional)
        res.cookie('isAdmin', true, { httpOnly: true });
        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
    }

    res.status(401).json({ error: 'Credenciales incorrectas' });
});

module.exports = router;