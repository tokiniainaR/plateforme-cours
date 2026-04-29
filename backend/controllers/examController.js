import {
  createExam,
  deleteExamById,
  getAllExams,
  getExamById,
  getExamsByInstructor,
  getExamsByStudent,
  updateExamById
} from '../models/examModel.js';
import { createSubmission, getSubmissionResult, getSubmissionsByExamId, gradeSubmissionById } from '../models/submissionModel.js';
import { getExamQuestions, createExamQuestion, updateExamQuestion, deleteExamQuestion } from '../models/examQuestionModel.js';

export const getExams = async (req, res, next) => {
  try {
    let exams;
    if (req.user.role === 'student') {
      exams = await getExamsByStudent(req.user.id);
    } else {
      exams = await getAllExams();
    }
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });
    res.json(exam);
  } catch (error) {
    next(error);
  }
};

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Fonction helper pour vérifier l'accès à un examen
const checkExamAccess = async (examId, user) => {
  const exam = await getExamById(examId);
  if (!exam) return null;

  if (user.role === 'student') {
    const { db } = await import('../config/db.js');
    const [enrollment] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user.id, exam.course_id]
    );
    if (!enrollment.length) return null;
  } else if (user.role === 'instructor') {
    if (exam.instructor_id !== user.id) return null;
  }
  // Admin a accès à tout

  return exam;
};

// Configuration de multer pour les fichiers d'examen
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'exams');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

export const createExamHandler = async (req, res, next) => {
  try {
    const { title, course_id, start_date, end_date, description, content } = req.body;

    if (!title || !title.toString().trim()) {
      return res.status(400).json({ message: 'Le titre de l examen est requis.' });
    }
    const courseId = Number(course_id);
    if (!courseId || courseId <= 0) {
      return res.status(400).json({ message: 'Le cours de l examen est requis.' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises.' });
    }

    let filePaths = [];
    if (req.files && req.files.length > 0) {
      filePaths = req.files.map(file => `/uploads/exams/${file.filename}`);
    }

    const examData = {
      course_id: courseId,
      title: title.toString().trim(),
      description: description?.toString().trim() || '',
      content: content?.toString().trim() || '',
      start_date,
      end_date,
      instructor_id: req.user.id,
      files: JSON.stringify(filePaths)
    };

    const exam = await createExam(examData);
    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
};

export const updateExamHandler = async (req, res, next) => {
  try {
    const exam = await updateExamById(req.params.id, req.body);
    res.json(exam);
  } catch (error) {
    next(error);
  }
};

export const deleteExamHandler = async (req, res, next) => {
  try {
    await deleteExamById(req.params.id);
    res.json({ message: 'Examen supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const submitExam = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });

    const { answers } = req.body;
    const submission = await createSubmission(req.params.id, req.user.id, answers || []);
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

export const getExamResult = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });

    const result = await getSubmissionResult(req.params.id, req.user.id);
    if (!result) return res.status(404).json({ message: 'Aucun résultat trouvé.' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentExams = async (req, res, next) => {
  try {
    const exams = await getExamsByStudent(req.user.id);
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

export const getInstructorExams = async (req, res, next) => {
  try {
    const exams = await getExamsByInstructor(req.user.id);
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

export const getExamSubmissions = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.examId, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });

    const submissions = await getSubmissionsByExamId(req.params.examId);
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    // Récupérer l'examen de la soumission pour vérifier l'accès
    const { db } = await import('../config/db.js');
    const [submission] = await db.query(
      'SELECT exam_id FROM submissions WHERE id = ?',
      [req.params.submissionId]
    );
    if (!submission.length) return res.status(404).json({ message: 'Soumission introuvable.' });

    const exam = await checkExamAccess(submission[0].exam_id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cette soumission.' });

    const { grade } = req.body;
    const result = await gradeSubmissionById(req.params.submissionId, grade);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getExamQuestionsHandler = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.examId, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });

    const questions = await getExamQuestions(req.params.examId);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const createExamQuestionHandler = async (req, res, next) => {
  try {
    const exam = await checkExamAccess(req.params.examId, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cet examen.' });

    const question = await createExamQuestion(req.params.examId, req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

export const updateExamQuestionHandler = async (req, res, next) => {
  try {
    // Récupérer l'examen de la question
    const { db } = await import('../config/db.js');
    const [question] = await db.query(
      'SELECT exam_id FROM exam_questions WHERE id = ?',
      [req.params.questionId]
    );
    if (!question.length) return res.status(404).json({ message: 'Question introuvable.' });

    const exam = await checkExamAccess(question[0].exam_id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cette question.' });

    const updatedQuestion = await updateExamQuestion(req.params.questionId, req.body);
    res.json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

export const deleteExamQuestionHandler = async (req, res, next) => {
  try {
    // Récupérer l'examen de la question
    const { db } = await import('../config/db.js');
    const [question] = await db.query(
      'SELECT exam_id FROM exam_questions WHERE id = ?',
      [req.params.questionId]
    );
    if (!question.length) return res.status(404).json({ message: 'Question introuvable.' });

    const exam = await checkExamAccess(question[0].exam_id, req.user);
    if (!exam) return res.status(403).json({ message: 'Accès non autorisé à cette question.' });

    await deleteExamQuestion(req.params.questionId);
    res.json({ message: 'Question supprimée.' });
  } catch (error) {
    next(error);
  }
};
