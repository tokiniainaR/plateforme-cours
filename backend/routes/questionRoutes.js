import express from 'express';
import {
  createQuestionHandler,
  deleteQuestionHandler,
  getCourseQuestions,
  getInstructorQuestions,
  getQuestions,
  getStudentQuestions,
  replyQuestionHandler,
  updateQuestionHandler
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/student/questions', authorize('student'), getStudentQuestions);
router.get('/instructor/questions', authorize('instructor'), getInstructorQuestions);
router.get('/', getQuestions);
router.post('/', authorize('student','instructor','admin'), createQuestionHandler);
router.put('/:id', authorize('student','instructor','admin'), updateQuestionHandler);
router.delete('/:id', authorize('student','instructor','admin'), deleteQuestionHandler);
router.post('/:id/reply', authorize('instructor','admin'), replyQuestionHandler);
router.get('/courses/:courseId/questions', getCourseQuestions);

export default router;
