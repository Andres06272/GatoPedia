function isAdmin(req, res, next) {
    if (req.cookies && req.cookies.isAdmin) {
        return next();
    }
    res.status(403).json({ error: 'Acceso denegado' });
}

module.exports = { isAdmin };