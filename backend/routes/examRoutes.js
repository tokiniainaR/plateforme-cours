import express from 'express';
import {
  createExamHandler,
  deleteExamHandler,
  getExam,
  getExams,
  getExamResult,
  getExamSubmissions,
  getInstructorExams,
  getStudentExams,
  gradeSubmission,
  submitExam,
  updateExamHandler,
  getExamQuestionsHandler,
  createExamQuestionHandler,
  updateExamQuestionHandler,
  deleteExamQuestionHandler,
  upload
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Routes statiques (avant les routes dynamiques)
router.get('/', getExams);
router.get('/student/exams', authorize('student'), getStudentExams);
router.get('/instructor/exams', authorize('instructor'), getInstructorExams);
router.post('/', authorize('instructor','admin'), upload.array('files'), createExamHandler);
router.post('/submissions/:submissionId/grade', authorize('instructor','admin'), gradeSubmission);
router.get('/:id/result', authorize('student','instructor','admin'), getExamResult);
router.post('/:id/submit', authorize('student','instructor','admin'), submitExam);

// Exam questions routes
router.get('/:examId/questions', authorize('instructor','admin','student'), getExamQuestionsHandler);
router.post('/:examId/questions', authorize('instructor','admin'), createExamQuestionHandler);
router.put('/questions/:questionId', authorize('instructor','admin'), updateExamQuestionHandler);
router.delete('/questions/:questionId', authorize('instructor','admin'), deleteExamQuestionHandler);

// Routes dynamiques
router.get('/:id', getExam);
router.put('/:id', authorize('instructor','admin'), updateExamHandler);
router.delete('/:id', authorize('instructor','admin'), deleteExamHandler);
router.get('/:examId/submissions', authorize('instructor','admin'), getExamSubmissions);

export default router;
