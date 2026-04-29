import { db } from '../config/db.js';

export const getStatistics = async () => {
  const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) AS totalStudents FROM users WHERE role = "student"');
  const [[{ totalFormateurs }]] = await db.query('SELECT COUNT(*) AS totalFormateurs FROM users WHERE role = "instructor"');
  const [[{ totalAdmins }]] = await db.query('SELECT COUNT(*) AS totalAdmins FROM users WHERE role = "admin"');
  const [[{ totalCourses }]] = await db.query('SELECT COUNT(*) AS totalCourses FROM courses');
  const [[{ totalExams }]] = await db.query('SELECT COUNT(*) AS totalExams FROM exams');
  const [[{ totalEnrollments }]] = await db.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');

  return {
    totalUsers,
    totalStudents,
    totalFormateurs,
    totalAdmins,
    totalCourses,
    totalExams,
    totalEnrollments
  };
};

export const getStudentStatistics = async (userId) => {
  // Get user information to determine their filiere
  const [userRows] = await db.query('SELECT filiere, created_at FROM users WHERE id = ?', [userId]);
  if (!userRows.length) {
    return {
      enrolledCourses: 0,
      completedCourses: 0,
      avgProgress: 0,
      totalTime: '0h'
    };
  }

  const user = userRows[0];
  const userFiliere = user.filiere;

  // Count courses available to the student based on their filiere
  const [courseRows] = await db.query('SELECT COUNT(*) AS enrolledCourses FROM courses WHERE filiere = ?', [userFiliere]);
  const enrolledCourses = courseRows[0]?.enrolledCourses || 0;

  // For now, completed courses and progress are not implemented
  const completedCourses = 0;
  const avgProgress = 0;

  // Calculate account age in hours
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalTime = `${diffHours}h`;

  return {
    enrolledCourses,
    completedCourses,
    avgProgress,
    totalTime
  };
};

export const getInstructorRecentActivities = async (instructorId) => {
  // Recent enrollments in instructor's courses
  const [enrollments] = await db.query(`
    SELECT 'enrollment' AS type, CONCAT(u.prenom, ' ', u.nom) AS student_name, c.title AS course_title, e.enrolled_at AS date
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    WHERE c.formateur_id = ?
    ORDER BY e.enrolled_at DESC
    LIMIT 10
  `, [instructorId]);

  // Recent submissions
  const [submissions] = await db.query(`
    SELECT 'submission' AS type, CONCAT(u.prenom, ' ', u.nom) AS student_name, ex.title AS exam_title, s.submitted_at AS date
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN exams ex ON s.exam_id = ex.id
    WHERE ex.instructor_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT 10
  `, [instructorId]);

  // Combine and sort
  const activities = [...enrollments, ...submissions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return activities.map((activity, index) => ({
    id: index + 1,
    type: activity.type === 'enrollment' ? 'etudiant' : 'devoir',
    message: activity.type === 'enrollment' ? `Nouvel étudiant inscrit à ${activity.course_title}` : `Devoir soumis pour ${activity.exam_title}`,
    time: formatTimeAgo(activity.date)
  }));
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (minutes > 0) return `Il y a ${minutes}min`;
  return 'À l\'instant';
};
