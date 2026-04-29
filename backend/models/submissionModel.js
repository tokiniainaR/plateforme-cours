import { db } from '../config/db.js';

export const createSubmission = async (examId, studentId, answers) => {
  const [result] = await db.query(
    'INSERT INTO submissions (exam_id, student_id, answers) VALUES (?, ?, ?)',
    [examId, studentId, JSON.stringify(answers || [])]
  );
  return getSubmissionById(result.insertId);
};

export const getSubmissionById = async (id) => {
  const [rows] = await db.query('SELECT * FROM submissions WHERE id = ?', [id]);
  return rows[0];
};

export const getSubmissionResult = async (examId, studentId) => {
  const [rows] = await db.query('SELECT * FROM submissions WHERE exam_id = ? AND student_id = ? ORDER BY created_at DESC LIMIT 1', [examId, studentId]);
  if (!rows.length) return null;
  const submission = rows[0];
  return {
    id: submission.id,
    exam_id: submission.exam_id,
    student_id: submission.student_id,
    answers: submission.answers ? JSON.parse(submission.answers) : [],
    grade: submission.grade,
    status: submission.status,
    created_at: submission.created_at
  };
};

export const getSubmissionsByExamId = async (examId) => {
  const [rows] = await db.query('SELECT submissions.*, CONCAT(users.prenom, " ", users.nom) AS student_name FROM submissions LEFT JOIN users ON submissions.student_id = users.id WHERE submissions.exam_id = ? ORDER BY submissions.created_at DESC', [examId]);
  return rows.map((submission) => ({
    ...submission,
    answers: submission.answers ? JSON.parse(submission.answers) : []
  }));
};

export const gradeSubmissionById = async (id, grade) => {
  const numericGrade = Number(grade) || 0;
  await db.query('UPDATE submissions SET grade = ?, status = ? WHERE id = ?', [numericGrade, 'graded', id]);
  const [rows] = await db.query('SELECT * FROM submissions WHERE id = ?', [id]);
  return rows[0];
};
