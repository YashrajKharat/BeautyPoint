import jwt from 'jsonwebtoken';

// ✅ SECURITY: Token expiration check
const TOKEN_EXPIRY = '7d'; // Shorter expiry for production security

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.userId = decoded.userId;
    req.adminRole = decoded.role;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Admin access denied' });
  }
};

export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  );
};

export default authMiddleware;
