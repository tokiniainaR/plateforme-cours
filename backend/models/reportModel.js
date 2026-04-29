import { db } from '../config/db.js';

export const getAllReports = async () => {
  const [rows] = await db.query(
    `SELECT reports.*, CONCAT(users.prenom, ' ', users.nom) AS reporter_name FROM reports
     LEFT JOIN users ON reports.user_id = users.id
     ORDER BY reports.created_at DESC`
  );
  return rows;
};

export const getReportById = async (id) => {
  const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
  return rows[0];
};

export const resolveReportById = async (id) => {
  await db.query('UPDATE reports SET status = ? WHERE id = ?', ['resolved', id]);
  return getReportById(id);
};

export const deleteReportById = async (id) => {
  await db.query('DELETE FROM reports WHERE id = ?', [id]);
};
