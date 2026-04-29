import {
  createCourse,
  deleteCourseById,
  enrollCourseForUser,
  getAllCourses,
  getCourseById,
  getCourseProgressForUser,
  getCourseStudents,
  getInstructorCoursesForUser,
  getStudentCoursesForUser,
  updateCourseById,
  addCourseContentById
} from '../models/courseModel.js';
import { getUserById } from '../models/userModel.js';
import { getStudentStatistics, getInstructorRecentActivities } from '../models/statisticsModel.js';

export const getCourses = async (req, res, next) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours introuvable.' });
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const createCourseHandler = async (req, res, next) => {
  try {
    const instructor = await getUserById(req.user.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Formateur introuvable.' });
    }

    const courseData = {
      ...req.body,
      formateur_id: req.user.id,
    };

    // Fixer la filière et la matière du cours au profil du formateur
    if (instructor.filiere) {
      courseData.filiere = instructor.filiere;
    }
    if (instructor.matiere_id) {
      courseData.matiere_id = instructor.matiere_id;
    }

    if (!courseData.matiere_id && !courseData.filiere_id) {
      return res.status(400).json({ message: 'La matière du cours est requise.' });
    }

    console.log('Creating course for instructor:', req.user.id, 'with data:', courseData);

    const course = await createCourse(courseData);
    console.log('Course created successfully:', course);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    next(error);
  }
};

export const updateCourseHandler = async (req, res, next) => {
  try {
    const course = await updateCourseById(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const uploadCourseVideoHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier vidéo reçu.' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const videoUrl = `${protocol}://${host}/uploads/videos/${req.file.filename}`;

    console.log('Video uploaded for course', req.params.id, '->', videoUrl);

    res.status(201).json({
      url: videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCoursePdfHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier PDF reçu.' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const pdfUrl = `${protocol}://${host}/uploads/pdfs/${req.file.filename}`;

    console.log('PDF uploaded for course', req.params.id, '->', pdfUrl);

    res.status(201).json({
      url: pdfUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCourseResourceHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier de ressource reçu.' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const resourceUrl = `${protocol}://${host}/uploads/resources/${req.file.filename}`;

    console.log('Resource uploaded for course', req.params.id, '->', resourceUrl);

    res.status(201).json({
      url: resourceUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseHandler = async (req, res, next) => {
  try {
    await deleteCourseById(req.params.id);
    res.json({ message: 'Cours supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const enrollCourseHandler = async (req, res, next) => {
  try {
    const enrollment = await enrollCourseForUser(req.user.id, req.params.id);
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

export const getCourseProgress = async (req, res, next) => {
  try {
    const progress = await getCourseProgressForUser(req.user.id, req.params.id);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const addCourseContent = async (req, res, next) => {
  try {
    await addCourseContentById(req.params.id, req.body);
    res.json({ message: 'Contenu de cours ajouté (simulation).' });
  } catch (error) {
    next(error);
  }
};

export const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await getInstructorCoursesForUser(req.user.id);
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getStudentCourses = async (req, res, next) => {
  try {
    console.log('=== getStudentCourses called ===');
    console.log('req.user:', req.user);
    console.log('User ID:', req.user?.id);
    const courses = await getStudentCoursesForUser(req.user.id);
    console.log('Courses returned from DB:', courses);
    console.log('Number of courses:', courses.length);
    res.json(courses);
  } catch (error) {
    console.error('Error in getStudentCourses:', error);
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    const stats = await getStudentStatistics(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getInstructorActivities = async (req, res, next) => {
  try {
    const activities = await getInstructorRecentActivities(req.user.id);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

export const getCourseStudentsHandler = async (req, res, next) => {
  try {
    const students = await getCourseStudents(req.params.id);
    res.json(students);
  } catch (error) {
    next(error);
  }
};
