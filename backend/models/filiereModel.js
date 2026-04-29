import { db } from '../config/db.js';

const mapFiliereRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  created_at: row.created_at
});

export const getAllFilieres = async () => {
  const [rows] = await db.query('SELECT id, name, description, created_at FROM filieres ORDER BY name ASC');
  return rows.map(mapFiliereRow);
};

export const getFiliereById = async (id) => {
  const [rows] = await db.query('SELECT id, name, description, created_at FROM filieres WHERE id = ?', [id]);
  return rows[0] ? mapFiliereRow(rows[0]) : null;
};

export const getFiliereByName = async (name) => {
  const [rows] = await db.query('SELECT id, name, description, created_at FROM filieres WHERE name = ?', [name]);
  return rows[0] ? mapFiliereRow(rows[0]) : null;
};

export const createFiliere = async ({ name, description }) => {
  const [result] = await db.query('INSERT INTO filieres (name, description) VALUES (?, ?)', [name, description || null]);
  return getFiliereById(result.insertId);
};

export const updateFiliereById = async (id, fields) => {
  const allowed = ['name', 'description'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (!keys.length) return getFiliereById(id);
  const values = keys.map((key) => fields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE filieres SET ${setClause} WHERE id = ?`, [...values, id]);
  return getFiliereById(id);
};

export const deleteFiliereById = async (id) => {
  await db.query('DELETE FROM filieres WHERE id = ?', [id]);
};

