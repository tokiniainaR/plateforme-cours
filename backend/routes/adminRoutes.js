import express from 'express';
import {
  approveCourse,
  blockAccount,
  deleteAccount,
  deleteCourseAdmin,
  deleteExamAdmin,
  deleteReport,
  getAccounts,
  getCoursesAdmin,
  getExamsAdmin,
  getReport,
  getReports,
  getStatisticsAdmin,
  getSystemHealth,
  getAccount,
  rejectCourse,
  resolveReport,
  suspendAccount,
  unblockAccount
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/accounts', getAccounts);
router.get('/accounts/:id', getAccount);
router.post('/accounts/:id/suspend', suspendAccount);
router.post('/accounts/:id/block', blockAccount);
router.post('/accounts/:id/unblock', unblockAccount);
router.delete('/accounts/:id', deleteAccount);

router.get('/courses', getCoursesAdmin);
router.post('/courses/:id/approve', approveCourse);
router.post('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourseAdmin);

router.get('/exams', getExamsAdmin);
router.delete('/exams/:id', deleteExamAdmin);

router.get('/reports', getReports);
router.get('/reports/:id', getReport);
router.post('/reports/:id/resolve', resolveReport);
router.delete('/reports/:id', deleteReport);

router.get('/statistics', getStatisticsAdmin);
router.get('/health', getSystemHealth);

export default router;
