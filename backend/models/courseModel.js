import { db } from '../config/db.js';
import { getMatiereById } from './matiereModel.js';

const normalizeNiveaux = (niveau) => {
  if (!niveau) return [];
  if (Array.isArray(niveau)) return niveau.map((n) => String(n).trim()).filter(Boolean);
  return String(niveau).split(',').map((level) => level.trim()).filter(Boolean);
};

const parseJsonField = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }
  if (typeof value === 'object') return value;
  return [];
};

const normalizeJsonField = (value) => {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return null;
};

const mapCourseRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  matiere: row.matiere_name || row.matiere,
  matiereId: row.matiere_id,
  matiereName: row.matiere_name,
  filiere: row.filiere_name || row.filiere,
  filiereId: row.filiere_id,
  filiereName: row.filiere_name,
  niveau: row.niveau,
  duree: row.duree || '',
  objectif: row.objectif || '',
  niveaux: normalizeNiveaux(row.niveau),
  etudiants: row.etudiants,
  videos: parseJsonField(row.videos),
  pdfs: parseJsonField(row.pdfs),
  quizzes: parseJsonField(row.quizzes),
  resources: parseJsonField(row.resources),
  reflectionQuestion: row.reflection_question || '',
  formateurId: row.formateur_id,
  formateurName: row.formateur_name,
  statut: row.statut,
  created_at: row.created_at
});

const courseSelect = `
  SELECT courses.*, CONCAT(users.prenom, ' ', users.nom) AS formateur_name,
         matieres.id AS matiere_id,
         matieres.name AS matiere_name,
         filieres.id AS filiere_id,
         filieres.name AS filiere_name
  FROM courses
  LEFT JOIN users ON courses.formateur_id = users.id
  LEFT JOIN matieres ON courses.matiere_id = matieres.id
  LEFT JOIN filieres ON filieres.id = COALESCE(matieres.filiere_id, courses.filiere_id)
`;

export const getAllCourses = async (includeAll = false) => {
  const filter = includeAll ? '' : 'WHERE statut = ?';
  const params = includeAll ? [] : ['approved'];
  const [rows] = await db.query(`${courseSelect} ${filter} ORDER BY courses.created_at DESC`, params);
  return rows.map(mapCourseRow);
};

export const getCourseById = async (id) => {
  const [rows] = await db.query(`${courseSelect} WHERE courses.id = ?`, [id]);
  return rows[0] ? mapCourseRow(rows[0]) : null;
};

export const createCourse = async ({ title, description, filiere_id, matiere_id, filiere, niveau, duree, objectif, etudiants, formateur_id, statut, videos, pdfs, quizzes, resources, reflectionQuestion }) => {
  const formattedNiveau = normalizeNiveaux(niveau).join(', ');

  if (matiere_id && !isNaN(matiere_id)) {
    const matiere = await getMatiereById(matiere_id);
    if (!matiere) {
      throw new Error('La matière sélectionnée est invalide.');
    }
    filiere_id = matiere.filiereId;
  } else if (!matiere_id && filiere_id) {
    const matiere = await db.query('SELECT id FROM matieres WHERE filiere_id = ? LIMIT 1', [filiere_id]);
    if (matiere[0].length) {
      matiere_id = matiere[0][0].id;
    }
  }

  const videosJson = normalizeJsonField(videos);
  const pdfsJson = normalizeJsonField(pdfs);
  const quizzesJson = normalizeJsonField(quizzes);
  const resourcesJson = normalizeJsonField(resources);

  const [result] = await db.query(
    'INSERT INTO courses (title, description, filiere, filiere_id, matiere_id, niveau, duree, objectif, reflection_question, etudiants, formateur_id, statut, videos, pdfs, quizzes, resources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      title,
      description,
      filiere || null,
      filiere_id || null,
      matiere_id || null,
      formattedNiveau,
      duree || null,
      objectif || null,
      reflectionQuestion || null,
      etudiants || 0,
      formateur_id,
      statut || 'approved',
      videosJson,
      pdfsJson,
      quizzesJson,
      resourcesJson
    ]
  );
  return getCourseById(result.insertId);
};

export const updateCourseById = async (id, fields) => {
  const allowed = ['title', 'description', 'filiere', 'filiere_id', 'matiere_id', 'niveau', 'duree', 'objectif', 'reflection_question', 'etudiants', 'statut', 'videos', 'pdfs', 'quizzes', 'resources'];
  const preparedFields = { ...fields };
  if (preparedFields.reflectionQuestion !== undefined) {
    preparedFields.reflection_question = preparedFields.reflectionQuestion;
    delete preparedFields.reflectionQuestion;
  }
  if (preparedFields.niveau) {
    preparedFields.niveau = normalizeNiveaux(preparedFields.niveau).join(', ');
  }

  ['videos', 'pdfs', 'quizzes', 'resources'].forEach((key) => {
    if (preparedFields[key] !== undefined) {
      preparedFields[key] = normalizeJsonField(preparedFields[key]);
    }
  });

  if (preparedFields.matiere_id) {
    const matiere = await getMatiereById(preparedFields.matiere_id);
    if (!matiere) {
      throw new Error('La matière sélectionnée est invalide.');
    }
    preparedFields.filiere_id = matiere.filiereId;
  }

  const keys = Object.keys(preparedFields).filter((key) => allowed.includes(key));
  if (!keys.length) return getCourseById(id);
  const values = keys.map((key) => preparedFields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE courses SET ${setClause} WHERE id = ?`, [...values, id]);
  return getCourseById(id);
};

export const deleteCourseById = async (id) => {
  await db.query('DELETE FROM courses WHERE id = ?', [id]);
};

export const enrollCourseForUser = async (userId, courseId) => {
  const [course] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
  if (!course.length) throw new Error('Cours introuvable.');
  await db.query(
    'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE enrolled_at = enrolled_at',
    [userId, courseId]
  );
  const [progressRows] = await db.query('SELECT progress FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  return progressRows[0];
};

export const getCourseProgressForUser = async (userId, courseId) => {
  const [rows] = await db.query('SELECT progress FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  return rows[0] || { progress: 0 };
};

export const getInstructorCoursesForUser = async (userId) => {
  const [rows] = await db.query(`
    SELECT courses.*, CONCAT(users.prenom, ' ', users.nom) AS formateur_name,
           matieres.id AS matiere_id,
           matieres.name AS matiere_name,
           filieres.id AS filiere_id,
           filieres.name AS filiere_name,
           COUNT(enrollments.user_id) AS etudiants
    FROM courses
    LEFT JOIN users ON courses.formateur_id = users.id
    LEFT JOIN matieres ON courses.matiere_id = matieres.id
    LEFT JOIN filieres ON filieres.id = COALESCE(matieres.filiere_id, courses.filiere_id)
    LEFT JOIN enrollments ON courses.id = enrollments.course_id
    WHERE courses.formateur_id = ?
    GROUP BY courses.id
    ORDER BY courses.created_at DESC
  `, [userId]);
  return rows.map(mapCourseRow);
};

export const getStudentCoursesForUser = async (userId) => {
  console.log('=== getStudentCoursesForUser called with userId:', userId);
  const query = `${courseSelect} JOIN enrollments ON courses.id = enrollments.course_id WHERE enrollments.user_id = ? ORDER BY enrollments.enrolled_at DESC`;
  console.log('SQL Query:', query);
  console.log('Parameters:', [userId]);
  const [rows] = await db.query(query, [userId]);
  console.log('Query result rows count:', rows.length);
  console.log('Query result rows:', rows);
  const result = rows.map((row) => ({ 
    ...mapCourseRow(row), 
    progress: row.progress,
    enrolled_at: row.enrolled_at,
    created_at: row.created_at
  }));
  console.log('Mapped result:', result);
  return result;
};

export const getCourseStudents = async (courseId) => {
  const [rows] = await db.query(`
    SELECT users.id, users.nom, users.prenom, users.email, users.filiere, users.niveau,
           enrollments.enrolled_at, enrollments.progress
    FROM enrollments
    JOIN users ON enrollments.user_id = users.id
    WHERE enrollments.course_id = ? AND users.role = 'student'
    ORDER BY enrollments.enrolled_at DESC
  `, [courseId]);
  
  return rows.map(row => ({
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    filiere: row.filiere,
    niveau: row.niveau,
    enrolledAt: row.enrolled_at,
    progress: row.progress || 0
  }));
};

export const addCourseContentById = async (id, fields) => {
  if (!fields || Object.keys(fields).length === 0) return getCourseById(id);
  const allowed = ['description', 'videos', 'pdfs', 'quizzes', 'resources'];
  const preparedFields = { ...fields };
  ['videos', 'pdfs', 'quizzes', 'resources'].forEach((key) => {
    if (preparedFields[key] !== undefined) {
      preparedFields[key] = normalizeJsonField(preparedFields[key]);
    }
  });
  const keys = Object.keys(preparedFields).filter((key) => allowed.includes(key));
  if (!keys.length) return getCourseById(id);
  const values = keys.map((key) => preparedFields[key]);
  const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await db.query(`UPDATE courses SET ${setClause} WHERE id = ?`, [...values, id]);
  return getCourseById(id);
};
