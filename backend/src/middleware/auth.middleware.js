const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role || 'student';
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token expiré ou invalide' });
  }
};

module.exports = authMiddleware;
module.exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({ message: 'Accès refusé: permissions insuffisantes' });
  }
  next();
};