const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({
        message: 'Invalid token format.'
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: 'Server configuration error.'
      });
    }

    const decoded = jwt.verify(token, secret);

    // Extract all fields including email and name
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user',
      email: decoded.email || '',
      name: decoded.name || ''
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired. Please log in again.'
      });
    }
    return res.status(401).json({
      message: 'Invalid token. Please log in again.'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Admin access required.'
  });
};

module.exports = { protect, adminOnly };