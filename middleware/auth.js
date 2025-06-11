/* ───────── middleware/auth.js ───────── */
import jwt       from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User         from '../models/User.js';

/* Attach user if token valid */
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User no longer exists');
    }
    res.locals.user = user;
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

/* Role‑based helpers */
export const role = (allowed = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

export const admin        = role(['admin']);
export const clientOnly    = role(['client']);
export const freelancerOnly = role(['freelancer']);
