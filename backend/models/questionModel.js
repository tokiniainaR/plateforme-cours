import { db } from '../config/db.js';

export const getAllQuestions = async () => {
  const [rows] = await db.query(
    `SELECT questions.*, courses.title AS course_title, CONCAT(users.prenom, ' ', users.nom) AS student_name, CONCAT(instructors.prenom, ' ', instructors.nom) AS instructor_name FROM questions
     LEFT JOIN courses ON questions.course_id = courses.id
     LEFT JOIN users ON questions.student_id = users.id
     LEFT JOIN users AS instructors ON questions.instructor_id = instructors.id
     ORDER BY questions.created_at DESC`
  );
  return rows;
};

export const getQuestionsByCourse = async (courseId) => {
  const [rows] = await db.query('SELECT * FROM questions WHERE course_id = ? ORDER BY created_at DESC', [courseId]);
  return rows;
};

export const createQuestion = async (studentId, { course_id, content }) => {
  const [result] = await db.query('INSERT INTO questions (course_id, student_id, content) VALUES (?, ?, ?)', [course_id, studentId, content]);
  const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
  return rows[0];
};

export const updateQuestionById = async (id, fields) => {
  const allowed = ['content', 'status'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (!keys.length) return getQuestionById(id);
  const values = keys.map((key) => fields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE questions SET ${setClause} WHERE id = ?`, [...values, id]);
  return getQuestionById(id);
};

export const deleteQuestionById = async (id) => {
  await db.query('DELETE FROM questions WHERE id = ?', [id]);
};

export const replyToQuestion = async (id, answer, instructorId) => {
  await db.query('UPDATE questions SET answer = ?, status = ? , instructor_id = ? WHERE id = ?', [answer, 'answered', instructorId, id]);
  return getQuestionById(id);
};

export const getQuestionsByStudent = async (studentId) => {
  const [rows] = await db.query('SELECT * FROM questions WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
  return rows;
};

export const getQuestionsByInstructor = async (instructorId) => {
  const [rows] = await db.query('SELECT * FROM questions WHERE instructor_id = ? ORDER BY created_at DESC', [instructorId]);
  return rows;
};

export const getQuestionById = async (id) => {
  const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
  return rows[0];
};
