import { db } from '../config/db.js';
import bcrypt from 'bcrypt';

export const createUser = async ({ nom, prenom, email, password, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, date_debut_metier }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === 'admin') {
    const [[{ totalAdmins }]] = await db.query('SELECT COUNT(*) AS totalAdmins FROM users WHERE role = "admin"');
    if (totalAdmins > 0) {
      const error = new Error('Un seul compte administrateur est autorisé.');
      error.statusCode = 400;
      throw error;
    }
  }

  const [result] = await db.query(
    'INSERT INTO users (nom, prenom, email, password, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, date_debut_metier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nom, prenom, email, hashedPassword, role, telephone, ville, adresse, filiere, matiere_id || null, niveau, naissance || null, date_debut_metier || null]
  );
  console.log('createUser insertId:', result.insertId, 'email:', email, 'role:', role);
  const [rows] = await db.query('SELECT id, nom, prenom, email, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, etat, created_at FROM users WHERE id = ?', [result.insertId]);
  return rows[0];
};

export const getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const getInstructorByMatiereId = async (matiere_id) => {
  const [rows] = await db.query('SELECT id FROM users WHERE matiere_id = ? AND role = "instructor" LIMIT 1', [matiere_id]);
  return rows[0];
};

export const getUserById = async (id) => {
  const [rows] = await db.query('SELECT id, nom, prenom, email, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, date_debut_metier, etat, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const getRawUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const getAllUsers = async (filter = 'all') => {
  let query = 'SELECT id, nom, prenom, email, role, telephone, ville, adresse, filiere, matiere_id, niveau, naissance, date_debut_metier, etat, created_at FROM users';
  const params = [];
  if (filter !== 'all') {
    query += ' WHERE role = ?';
    params.push(filter);
  }
  const [rows] = await db.query(query, params);
  console.log('getAllUsers filter:', filter, 'count:', rows.length);
  return rows;
};

export const updateUserStatus = async (id, status) => {
  const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
  if (rows.length && rows[0].role === 'admin' && status !== 'active') {
    const error = new Error('Le compte administrateur ne peut pas être suspendu ou bloqué.');
    error.statusCode = 403;
    throw error;
  }
  await db.query('UPDATE users SET etat = ? WHERE id = ?', [status, id]);
};

export const deleteUserById = async (id) => {
  const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
  if (rows.length && rows[0].role === 'admin') {
    const error = new Error('Le compte administrateur ne peut pas être supprimé.');
    error.statusCode = 403;
    throw error;
  }

  // Supprimer d'abord les examens du formateur pour éviter de laisser des examens orphelins.
  await db.query('DELETE FROM exams WHERE instructor_id = ?', [id]);
  // Supprimer ensuite les cours créés par le formateur.
  await db.query('DELETE FROM courses WHERE formateur_id = ?', [id]);
  await db.query('DELETE FROM users WHERE id = ?', [id]);
};

export const updateUserProfile = async (id, fields) => {
  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined && key !== 'specialites');
  if (!keys.length) return getUserById(id);
  
  const values = keys.map((key) => fields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
  return getUserById(id);
};

export const updateUserPassword = async (id, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
};
