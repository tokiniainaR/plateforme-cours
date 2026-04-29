import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  addCourseContent,
  createCourseHandler,
  deleteCourseHandler,
  enrollCourseHandler,
  getCourse,
  getCourses,
  getCourseProgress,
  getCourseStudentsHandler,
  getInstructorCourses,
  getInstructorActivities,
  getStudentCourses,
  getStudentStats,
  updateCourseHandler,
  uploadCourseVideoHandler,
  uploadCoursePdfHandler,
  uploadCourseResourceHandler
} from '../controllers/courseController.js';
import { getCourseQuestions } from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
const pdfUploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
const resourceUploadDir = path.join(process.cwd(), 'uploads', 'resources');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(pdfUploadDir)) {
  fs.mkdirSync(pdfUploadDir, { recursive: true });
}
if (!fs.existsSync(resourceUploadDir)) {
  fs.mkdirSync(resourceUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfUploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resourceUploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Seuls les fichiers vidéo sont autorisés.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 200 * 1024 * 1024 }
});

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Seuls les fichiers PDF sont autorisés.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

const resourceUpload = multer({
  storage: resourceStorage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/octet-stream'
    ];
    const extensionAllowed = ['.pdf', '.zip', '.rar', '.7z'];
    if (allowed.includes(file.mimetype) || extensionAllowed.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
      return cb(null, true);
    }
    return cb(new Error('Seuls les fichiers PDF, ZIP, RAR ou 7Z sont autorisés.'));
  },
  limits: { fileSize: 200 * 1024 * 1024 }
});

router.get('/', getCourses);
router.get('/student/courses', protect, authorize('student'), getStudentCourses);
router.get('/student/stats', protect, authorize('student'), getStudentStats);
router.get('/instructor/courses', protect, getInstructorCourses);
router.get('/instructor/activities', protect, authorize('instructor'), getInstructorActivities);
router.get('/:courseId/questions', protect, authorize('student','instructor','admin'), getCourseQuestions);
router.post('/', protect, authorize('instructor','admin'), createCourseHandler);
router.get('/:id', getCourse);
router.post('/:id/enroll', protect, authorize('student','instructor','admin'), enrollCourseHandler);
router.get('/:id/progress', protect, authorize('student','instructor','admin'), getCourseProgress);
router.get('/:id/students', protect, authorize('instructor','admin'), getCourseStudentsHandler);
router.put('/:id', protect, authorize('instructor','admin'), updateCourseHandler);
router.delete('/:id', protect, authorize('instructor','admin'), deleteCourseHandler);
router.post('/:id/content', protect, authorize('instructor','admin'), addCourseContent);
router.post('/:id/videos/upload', protect, authorize('instructor','admin'), upload.single('video'), uploadCourseVideoHandler);
router.post('/:id/pdfs/upload', protect, authorize('instructor','admin'), pdfUpload.single('pdf'), uploadCoursePdfHandler);
router.post('/:id/resources/upload', protect, authorize('instructor','admin'), resourceUpload.single('resource'), uploadCourseResourceHandler);

export default router;
