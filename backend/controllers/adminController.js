import { getAllUsers, getUserById, updateUserStatus, deleteUserById } from '../models/userModel.js';
import { getAllCourses, getCourseById, updateCourseById, deleteCourseById } from '../models/courseModel.js';
import { getAllExams, deleteExamById } from '../models/examModel.js';
import { getAllReports, getReportById, resolveReportById, deleteReportById } from '../models/reportModel.js';
import { getStatistics } from '../models/statisticsModel.js';
import { db } from '../config/db.js';

export const getAccounts = async (req, res, next) => {
  try {
    const filter = req.query.filter || 'all';
    const users = await getAllUsers(filter);
    console.log('getAccounts filter:', filter, 'users:', users.length);
    res.json(users.map((user) => ({ ...user, password: undefined })));
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Compte introuvable.' });
    
    // Pour les formateurs, compter le nombre de cours créés
    let coursesCount = 0;
    if (user.role === 'instructor') {
      const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM courses WHERE formateur_id = ?', [req.params.id]);
      coursesCount = count;
    }
    
    res.json({ ...user, password: undefined, coursesCount });
  } catch (error) {
    next(error);
  }
};

export const suspendAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'suspended');
    res.json({ message: 'Compte suspendu.' });
  } catch (error) {
    next(error);
  }
};

export const blockAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'blocked');
    res.json({ message: 'Compte bloqué.' });
  } catch (error) {
    next(error);
  }
};

export const unblockAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'active');
    res.json({ message: 'Compte débloqué.' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await deleteUserById(req.params.id);
    res.json({ message: 'Compte supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const getCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await getAllCourses(true);
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const approveCourse = async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours introuvable.' });
    await updateCourseById(req.params.id, { statut: 'approved' });
    res.json({ message: 'Cours approuvé.' });
  } catch (error) {
    next(error);
  }
};

export const rejectCourse = async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours introuvable.' });
    await updateCourseById(req.params.id, { statut: 'rejected' });
    res.json({ message: 'Cours rejeté.' });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseAdmin = async (req, res, next) => {
  try {
    await deleteCourseById(req.params.id);
    res.json({ message: 'Cours supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const getExamsAdmin = async (req, res, next) => {
  try {
    const exams = await getAllExams();
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

export const deleteExamAdmin = async (req, res, next) => {
  try {
    await deleteExamById(req.params.id);
    res.json({ message: 'Examen supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await getAllReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    await resolveReportById(req.params.id);
    res.json({ message: 'Signalement résolu.' });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    await deleteReportById(req.params.id);
    res.json({ message: 'Signalement supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const getStatisticsAdmin = async (req, res, next) => {
  try {
    const stats = await getStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res) => {
  res.json({ status: 'ok', service: 'admin', timestamp: new Date().toISOString() });
};
