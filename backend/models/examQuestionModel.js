import { db } from '../config/db.js';

export const getExamQuestions = async (examId) => {
  const [rows] = await db.query('SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY id', [examId]);
  return rows.map(question => ({
    ...question,
    options: question.options ? JSON.parse(question.options) : []
  }));
};

export const createExamQuestion = async (examId, questionData) => {
  const { question_text, question_type, options, correct_answer, points } = questionData;
  const [result] = await db.query(
    'INSERT INTO exam_questions (exam_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)',
    [examId, question_text, question_type || 'multiple-choice', JSON.stringify(options || []), correct_answer, points || 1]
  );
  return getExamQuestionById(result.insertId);
};

export const getExamQuestionById = async (id) => {
  const [rows] = await db.query('SELECT * FROM exam_questions WHERE id = ?', [id]);
  if (!rows.length) return null;
  const question = rows[0];
  return {
    ...question,
    options: question.options ? JSON.parse(question.options) : []
  };
};

export const updateExamQuestion = async (id, fields) => {
  const allowed = ['question_text', 'question_type', 'options', 'correct_answer', 'points'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));
  if (!keys.length) return getExamQuestionById(id);
  
  const values = keys.map((key) => {
    if (key === 'options') return JSON.stringify(fields[key] || []);
    return fields[key];
  });
  
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE exam_questions SET ${setClause} WHERE id = ?`, [...values, id]);
  return getExamQuestionById(id);
};

export const deleteExamQuestion = async (id) => {
  await db.query('DELETE FROM exam_questions WHERE id = ?', [id]);
};