const jwt = require('jsonwebtoken');

/**
 * Auth Middleware for Booking Service
 * Verifies JWT token independently (does not call station-service).
 * The token was originally issued by station-service auth,
 * but both services share the same JWT_SECRET so verification works here too.
 */

// Middleware: verify Bearer JWT token
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware: restrict access to admin role only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
