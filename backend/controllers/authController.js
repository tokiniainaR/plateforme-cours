import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { createUser, getInstructorByMatiereId, getUserByEmail, getUserById, updateUserPassword, updateUserProfile } from '../models/userModel.js';
import { getFiliereByName } from '../models/filiereModel.js';
import { getMatiereById } from '../models/matiereModel.js';
import { enrollCourseForUser } from '../models/courseModel.js';
import { mapRole } from '../utils/roleUtils.js';

const jwtSecret = process.env.JWT_SECRET || 'elearning_secret';
const jwtExpires = process.env.JWT_EXPIRES_IN || '1d';

const generateToken = (user) => jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpires });

export const register = async (req, res, next) => {
  try {
    console.log('Register req.body:', req.body);
    const { nom, prenom, email, password, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, date_debut_metier } = req.body;

    if (!nom || !prenom || !email || !password || !role) {
      return res.status(400).json({ message: 'Données manquantes pour l\'inscription.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const mappedRole = mapRole(role);
    
    if (mappedRole === 'instructor') {
      if (!matiere_id) {
        return res.status(400).json({ message: 'Un formateur doit être associé à une matière.' });
      }
      const matiereRecord = await getMatiereById(matiere_id);
      if (!matiereRecord) {
        return res.status(400).json({ message: 'La matière sélectionnée est invalide.' });
      }
      const existingInstructor = await getInstructorByMatiereId(matiere_id);
      if (existingInstructor) {
        return res.status(400).json({ message: 'Cette matière est déjà assignée à un autre formateur.' });
      }
    }

    if (filiere) {
      const filiereRecord = await getFiliereByName(filiere);
      if (!filiereRecord) {
        return res.status(400).json({ message: 'La filière sélectionnée est invalide.' });
      }
    }

    const newUser = await createUser({ 
      nom, 
      prenom, 
      email, 
      password, 
      role: mappedRole, 
      telephone, 
      ville, 
      adresse, 
      filiere, 
      matiere_id: matiere_id || null,
      niveau, 
      naissance,
      date_debut_metier: date_debut_metier || null
    });

    // Auto-enroll student in matching courses
    if (mappedRole === 'student' && filiere && niveau) {
      try {
        const [courses] = await db.query(
          'SELECT id FROM courses WHERE filiere = ? AND CONCAT(",", niveau, ",") LIKE CONCAT("%,", ?, ",%") AND statut = "approved"',
          [filiere, niveau]
        );
        for (const course of courses) {
          await enrollCourseForUser(newUser.id, course.id);
        }
      } catch (enrollError) {
        console.error('Auto-enrollment error:', enrollError);
        // Don't fail registration if enrollment fails
      }
    }

    const token = generateToken(newUser);

    res.status(201).json({ user: { ...newUser, password: undefined }, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (user.etat !== 'active') {
      return res.status(403).json({ message: `Compte ${user.etat}.` });
    }

    const token = generateToken(user);
    res.json({ user: { ...user, password: undefined }, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ ...user, password: undefined });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, ville, adresse, filiere, matiere_id, niveau, date_debut_metier } = req.body;
    if (matiere_id) {
      const matiereRecord = await getMatiereById(matiere_id);
      if (!matiereRecord) {
        return res.status(400).json({ message: 'La matière sélectionnée est invalide.' });
      }
    }
    if (filiere) {
      const filiereRecord = await getFiliereByName(filiere);
      if (!filiereRecord) {
        return res.status(400).json({ message: 'La filière sélectionnée est invalide.' });
      }
    }
    const updatedUser = await updateUserProfile(req.user.id, { nom, prenom, telephone, ville, adresse, filiere, matiere_id, niveau, date_debut_metier });
    res.json({ ...updatedUser, password: undefined });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis.' });
    }

    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const matched = await bcrypt.compare(oldPassword, user.password);
    if (!matched) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });
    }

    await updateUserPassword(req.user.id, newPassword);
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email requis pour réinitialiser le mot de passe.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Compte introuvable.' });
    }

    res.json({ message: 'Un lien de réinitialisation a été envoyé (simulation).' });
  } catch (error) {
    next(error);
  }
};
