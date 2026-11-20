
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const SECRET = process.env.JWT_SECRET || 'dev_secret';

// 1. Generate JWT token
export function makeToken(user) {
  return jwt.sign(
    { userId: String(user._id) },
    SECRET,
    { expiresIn: '7d' }
  );
}

// 2. Get token from request header
function getToken(req) {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  return null;
}

// 3. Check user authentication
export async function auth(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Please log in first.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET);

    // Find user in database
    const user = await User.findById(decoded.userId)
      .select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'User not found.'
      });
    }

    // Store user information
    req.user = user;
    req.userId = user._id;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }
}

// 4. Optional authentication
export async function optionalAuth(req, res, next) {
  try {
    const token = getToken(req);

    req.user = null;
    req.userId = null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, SECRET);

    const user = await User.findById(decoded.userId)
      .select('-password');

    if (user) {
      req.user = user;
      req.userId = user._id;
    }

    next();

  } catch (error) {
    // Continue even if token is invalid
    next();
  }
}
