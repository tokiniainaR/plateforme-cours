import { db } from '../config/db.js';

export const getAllExams = async () => {
  const [rows] = await db.query(
    `SELECT exams.*, courses.title AS course_title, matieres.name AS course_matiere, CONCAT(users.prenom, ' ', users.nom) AS instructor_name,
     CONCAT(FLOOR(HOUR(TIMEDIFF(exams.end_date, exams.start_date))), 'h ', 
            MINUTE(TIMEDIFF(exams.end_date, exams.start_date)), 'min') AS duration
     FROM exams
     LEFT JOIN courses ON exams.course_id = courses.id
     LEFT JOIN matieres ON courses.matiere_id = matieres.id
     LEFT JOIN users ON exams.instructor_id = users.id
     ORDER BY exams.created_at DESC`
  );
  return rows;
};

export const getExamById = async (id) => {
  const [rows] = await db.query(
    `SELECT exams.*, courses.title AS course_title, matieres.name AS course_matiere, CONCAT(users.prenom, ' ', users.nom) AS instructor_name,
     CONCAT(FLOOR(HOUR(TIMEDIFF(exams.end_date, exams.start_date))), 'h ', 
            MINUTE(TIMEDIFF(exams.end_date, exams.start_date)), 'min') AS duration
     FROM exams
     LEFT JOIN courses ON exams.course_id = courses.id
     LEFT JOIN matieres ON courses.matiere_id = matieres.id
     LEFT JOIN users ON exams.instructor_id = users.id
     WHERE exams.id = ?`,
    [id]
  );
  return rows[0];
};

export const createExam = async ({ course_id, title, description, content, start_date, end_date, instructor_id, files }) => {
  const [result] = await db.query(
    'INSERT INTO exams (course_id, title, description, content, start_date, end_date, instructor_id, files) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      course_id,
      title?.toString().trim() || '',
      description?.toString().trim() || null,
      content?.toString().trim() || null,
      start_date || null,
      end_date || null,
      instructor_id,
      files || null
    ]
  );
  return getExamById(result.insertId);
};

export const updateExamById = async (id, fields) => {
  const allowed = ['title', 'description', 'content', 'duration', 'course_id', 'published', 'start_date', 'end_date'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (!keys.length) return getExamById(id);
  const values = keys.map((key) => fields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE exams SET ${setClause} WHERE id = ?`, [...values, id]);
  return getExamById(id);
};

export const deleteExamById = async (id) => {
  await db.query('DELETE FROM exams WHERE id = ?', [id]);
};

export const getExamsByInstructor = async (instructorId) => {
  const [rows] = await db.query(
    `SELECT exams.*, courses.title AS course_title, matieres.name AS course_matiere,
     CONCAT(FLOOR(HOUR(TIMEDIFF(exams.end_date, exams.start_date))), 'h ', 
            MINUTE(TIMEDIFF(exams.end_date, exams.start_date)), 'min') AS duration
     FROM exams 
     LEFT JOIN courses ON exams.course_id = courses.id 
     LEFT JOIN matieres ON courses.matiere_id = matieres.id
     WHERE exams.instructor_id = ? 
     ORDER BY exams.created_at DESC`,
    [instructorId]
  );
  return rows;
};

export const getExamsByStudent = async (studentId) => {
  const [rows] = await db.query(
    `SELECT exams.*, courses.title AS course_title, matieres.name AS course_matiere, CONCAT(users.prenom, ' ', users.nom) AS instructor_name,
     CONCAT(FLOOR(HOUR(TIMEDIFF(exams.end_date, exams.start_date))), 'h ', 
            MINUTE(TIMEDIFF(exams.end_date, exams.start_date)), 'min') AS duration
     FROM exams
     JOIN enrollments ON enrollments.course_id = exams.course_id
     LEFT JOIN courses ON exams.course_id = courses.id
     LEFT JOIN matieres ON courses.matiere_id = matieres.id
     LEFT JOIN users ON exams.instructor_id = users.id
     WHERE enrollments.user_id = ? AND exams.published = 1
     ORDER BY exams.created_at DESC`,
    [studentId]
  );
  return rows;
};
