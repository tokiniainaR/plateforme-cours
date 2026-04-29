import { db } from '../config/db.js';

const mapMatiereRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  filiereId: row.filiere_id,
  filiereName: row.filiere_name,
  created_at: row.created_at
});

export const getAllMatieres = async () => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
    FROM matieres m
    LEFT JOIN filieres f ON m.filiere_id = f.id
    ORDER BY m.name ASC
  `);
  return rows.map(mapMatiereRow);
};

export const getMatiereById = async (id) => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
    FROM matieres m
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE m.id = ?
  `, [id]);
  return rows[0] ? mapMatiereRow(rows[0]) : null;
};

export const getMatiereByNameAndFiliere = async (name, filiereId) => {
  const [rows] = await db.query(
    `SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
     FROM matieres m
     LEFT JOIN filieres f ON m.filiere_id = f.id
     WHERE m.name = ? AND m.filiere_id = ?`,
    [name, filiereId]
  );
  return rows[0] ? mapMatiereRow(rows[0]) : null;
};

export const getMatieresByFiliereId = async (filiereId) => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
    FROM matieres m
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE m.filiere_id = ?
    ORDER BY m.name ASC
  `, [filiereId]);
  return rows.map(mapMatiereRow);
};

export const getAvailableMatieres = async () => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
    FROM matieres m
    LEFT JOIN users u ON u.matiere_id = m.id AND u.role = 'instructor'
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE u.id IS NULL
    ORDER BY m.name ASC
  `);
  return rows.map(mapMatiereRow);
};

export const getAvailableMatieresByFiliereId = async (filiereId) => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.description, m.filiere_id, f.name AS filiere_name, m.created_at
    FROM matieres m
    LEFT JOIN users u ON u.matiere_id = m.id AND u.role = 'instructor'
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE m.filiere_id = ? AND u.id IS NULL
    ORDER BY m.name ASC
  `, [filiereId]);
  return rows.map(mapMatiereRow);
};

export const createMatiere = async ({ name, description, filiere_id }) => {
  const [result] = await db.query('INSERT INTO matieres (name, description, filiere_id) VALUES (?, ?, ?)', [name, description || null, filiere_id || null]);
  return getMatiereById(result.insertId);
};

export const updateMatiereById = async (id, fields) => {
  const allowed = ['name', 'description', 'filiere_id'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (!keys.length) return getMatiereById(id);
  const values = keys.map((key) => fields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE matieres SET ${setClause} WHERE id = ?`, [...values, id]);
  return getMatiereById(id);
};

export const deleteMatiereById = async (id) => {
  await db.query('DELETE FROM matieres WHERE id = ?', [id]);
};
