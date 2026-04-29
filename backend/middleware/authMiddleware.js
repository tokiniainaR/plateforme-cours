import jwt from 'jsonwebtoken';
import { getUserById } from '../models/userModel.js';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET doit être défini en production.');
  }
  console.warn('⚠️  JWT_SECRET non défini — utilisation du secret par défaut (développement seulement).');
  jwtSecret = 'elearning_secret';
}

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  const token = authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decoded:', decoded);
    const user = await getUserById(decoded.id);
    console.log('User from DB:', user);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable.' });
    if (user.etat !== 'active') return res.status(403).json({ message: `Compte ${user.etat}.` });

    req.user = { id: user.id, role: user.role };
    console.log('req.user set to:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    next();
  };
};
