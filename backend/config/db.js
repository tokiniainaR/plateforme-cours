import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export let db;

const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'elearning' } = process.env;

const createDatabase = async (connection) => {
  await connection.query('CREATE DATABASE IF NOT EXISTS `' + DB_NAME + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await connection.query('USE `' + DB_NAME + '`');
};

const createTables = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
      telephone VARCHAR(50),
      ville VARCHAR(100),
      adresse VARCHAR(255),
      filiere VARCHAR(100),
      matiere_id INT,
      niveau VARCHAR(100),
      naissance DATE,
      date_debut_metier DATE,
      etat ENUM('active','suspended','blocked') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  const [userSpecialitesColumn] = await connection.query("SHOW COLUMNS FROM users LIKE 'specialites'");
  if (userSpecialitesColumn.length) {
    await connection.query('ALTER TABLE users DROP COLUMN specialites');
  }

  const [userStartDateColumn] = await connection.query("SHOW COLUMNS FROM users LIKE 'date_debut_metier'");
  if (!userStartDateColumn.length) {
    await connection.query('ALTER TABLE users ADD COLUMN date_debut_metier DATE NULL AFTER naissance');
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS filieres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS matieres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      filiere_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_matiere_filiere (name, filiere_id)
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      filiere VARCHAR(100),
      filiere_id INT,
      matiere_id INT,
      niveau VARCHAR(100),
      duree VARCHAR(100),
      objectif TEXT,
      etudiants INT DEFAULT 0,
      formateur_id INT,
      statut ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
      videos JSON NULL,
      pdfs JSON NULL,
      quizzes JSON NULL,
      resources JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formateur_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  const [courseFiliereIdColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'filiere_id'");
  if (!courseFiliereIdColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN filiere_id INT NULL AFTER filiere');
    await connection.query('ALTER TABLE courses ADD CONSTRAINT fk_courses_filiere_id FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE SET NULL');
  }

  const [courseMatiereIdColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'matiere_id'");
  if (!courseMatiereIdColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN matiere_id INT NULL AFTER filiere_id');
    await connection.query('ALTER TABLE courses ADD CONSTRAINT fk_courses_matiere_id FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE SET NULL');
  }

  const [courseDureeColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'duree'");
  if (!courseDureeColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN duree VARCHAR(100) NULL AFTER niveau');
  }

  const [courseObjectifColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'objectif'");
  if (!courseObjectifColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN objectif TEXT NULL AFTER duree');
  }

  const [courseReflectionQuestionColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'reflection_question'");
  if (!courseReflectionQuestionColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN reflection_question TEXT NULL AFTER objectif');
  }

  const [courseVideosColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'videos'");
  if (courseVideosColumn.length) {
    const existingType = String(courseVideosColumn[0].Type || '').toLowerCase();
    if (existingType !== 'json') {
      await connection.query('ALTER TABLE courses DROP COLUMN videos');
      await connection.query('ALTER TABLE courses ADD COLUMN videos JSON NULL AFTER objectif');
    }
  } else {
    await connection.query('ALTER TABLE courses ADD COLUMN videos JSON NULL AFTER objectif');
  }

  const [coursePdfsColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'pdfs'");
  if (!coursePdfsColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN pdfs JSON NULL AFTER videos');
  }

  const [courseQuizzesColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'quizzes'");
  if (!courseQuizzesColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN quizzes JSON NULL AFTER pdfs');
  }

  const [courseResourcesColumn] = await connection.query("SHOW COLUMNS FROM courses LIKE 'resources'");
  if (!courseResourcesColumn.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN resources JSON NULL AFTER quizzes');
  }

  const [userMatiereIdColumn] = await connection.query("SHOW COLUMNS FROM users LIKE 'matiere_id'");
  if (!userMatiereIdColumn.length) {
    await connection.query('ALTER TABLE users ADD COLUMN matiere_id INT NULL AFTER filiere');
    await connection.query('ALTER TABLE users ADD CONSTRAINT fk_users_matiere_id FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE SET NULL');
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      progress INT DEFAULT 0,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_enrollment (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content TEXT,
      files JSON NULL,
      duration VARCHAR(50),
      start_date DATETIME,
      end_date DATETIME,
      instructor_id INT,
      published TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  const [examContentColumn] = await connection.query("SHOW COLUMNS FROM exams LIKE 'content'");
  if (!examContentColumn.length) {
    console.log('Migration: ajout de la colonne content dans exams');
    await connection.query('ALTER TABLE exams ADD COLUMN content TEXT NULL AFTER description');
  }

  const [examFilesColumn] = await connection.query("SHOW COLUMNS FROM exams LIKE 'files'");
  if (!examFilesColumn.length) {
    console.log('Migration: ajout de la colonne files dans exams');
    await connection.query('ALTER TABLE exams ADD COLUMN files JSON NULL AFTER content');
  } else {
    const existingType = String(examFilesColumn[0].Type || '').toLowerCase();
    if (existingType !== 'json') {
      console.log(`Migration: conversion de la colonne files de ${existingType} vers JSON`);
      await connection.query('ALTER TABLE exams MODIFY COLUMN files JSON NULL AFTER content');
    }
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      student_id INT NOT NULL,
      answers JSON,
      grade INT DEFAULT 0,
      status ENUM('pending','graded') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  const [examStartDateColumn] = await connection.query("SHOW COLUMNS FROM exams LIKE 'start_date'");
  if (!examStartDateColumn.length) {
    await connection.query('ALTER TABLE exams ADD COLUMN start_date DATETIME NULL AFTER duration');
  }

  const [examEndDateColumn] = await connection.query("SHOW COLUMNS FROM exams LIKE 'end_date'");
  if (!examEndDateColumn.length) {
    await connection.query('ALTER TABLE exams ADD COLUMN end_date DATETIME NULL AFTER start_date');
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exam_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      question_text TEXT NOT NULL,
      question_type ENUM('multiple-choice','true-false','short-answer','essay') DEFAULT 'multiple-choice',
      options JSON,
      correct_answer TEXT,
      points INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      student_id INT,
      instructor_id INT,
      content TEXT NOT NULL,
      answer TEXT,
      status ENUM('open','answered') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      type VARCHAR(100),
      message TEXT,
      status ENUM('open','resolved') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);
};

const seedData = async (connection) => {
  const [existingUsers] = await connection.query('SELECT id FROM users LIMIT 1');
  const adminPassword = 'tokyadmin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const [adminRows] = await connection.query('SELECT id FROM users WHERE role = "admin"');
  if (adminRows.length === 0) {
    await connection.query(
      'INSERT INTO users (nom, prenom, email, password, role, telephone, ville, adresse, filiere, niveau, naissance, etat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Admin', 'Plateforme', 'admintoky@gmail.com', passwordHash, 'admin', '+33000000000', 'Paris', 'Siège', 'Gestion', 'Avancé', '1990-01-01', 'active']
    );
    console.log('Seeded default admin account: admintoky@gmail.com');
  } else {
    const adminId = adminRows[0].id;
    await connection.query('UPDATE users SET email = ?, password = ?, etat = ? WHERE id = ?', ['admintoky@gmail.com', passwordHash, 'active', adminId]);
    if (adminRows.length > 1) {
      const extraAdminIds = adminRows.slice(1).map((row) => row.id);
      await connection.query(
        `UPDATE users SET role = 'instructor' WHERE id IN (${extraAdminIds.map(() => '?').join(',')})`,
        extraAdminIds
      );
      console.log('Demoted extra admin accounts to instructor to enforce a single admin account.');
    }
    console.log('Updated existing admin credentials and reactivated the admin account.');
  }

  const defaultFilieres = ['Informatique', 'Gestion', 'Divers'];
  for (const name of defaultFilieres) {
    await connection.query('INSERT INTO filieres (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [name]);
  }

  const defaultMatieres = [
    { name: 'Programmation', filiere: 'Informatique' },
    { name: 'Marketing', filiere: 'Gestion' },
    { name: 'Design', filiere: 'Divers' }
  ];

  const [filiereRows] = await connection.query('SELECT id, name FROM filieres WHERE name IN (?, ?, ?)', defaultFilieres);
  const filiereMap = filiereRows.reduce((acc, row) => ({ ...acc, [row.name]: row.id }), {});

  for (const matiere of defaultMatieres) {
    const filiereId = filiereMap[matiere.filiere];
    if (!filiereId) continue;
    await connection.query(
      'INSERT INTO matieres (name, description, filiere_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = name',
      [matiere.name, `Matière de ${matiere.filiere}`, filiereId]
    );
  }

  const [matiereRows] = await connection.query(
    'SELECT m.id, m.name, f.name AS filiere_name FROM matieres m JOIN filieres f ON m.filiere_id = f.id WHERE f.name IN (?, ?, ?)',
    defaultFilieres
  );
  const matiereMap = matiereRows.reduce((acc, row) => ({ ...acc, [`${row.filiere_name}:${row.name}`]: row.id }), {});

  if (existingUsers.length === 0) {
    const [instructorResult] = await connection.query(
      'INSERT INTO users (nom, prenom, email, password, role, telephone, ville, adresse, filiere, niveau, naissance, matiere_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Alice', 'Dupont', 'alice@plateforme.local', passwordHash, 'instructor', '+33000000001', 'Lyon', 'Rue du Pôle', 'Informatique', 'Avancé', '1985-05-15', matiereMap['Informatique:Programmation'] || null]
    );
    const [studentResult] = await connection.query(
      'INSERT INTO users (nom, prenom, email, password, role, telephone, ville, adresse, filiere, niveau, naissance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Jean', 'Martin', 'jean@plateforme.local', passwordHash, 'student', '+33000000002', 'Marseille', 'Rue des Études', 'Informatique', 'Débutant', '2000-02-20']
    );

    await connection.query(
      'INSERT INTO courses (title, description, filiere, filiere_id, matiere_id, niveau, etudiants, formateur_id, statut) VALUES ? ',
      [[
        ['Découverte du Web', 'Apprenez les bases du HTML, CSS et JavaScript avec des projets pratiques.', 'Informatique', filiereMap['Informatique'], matiereMap['Informatique:Programmation'], 'Débutant', 240, instructorResult.insertId, 'approved'],
        ['Marketing Digital', 'Stratégies efficaces pour développer une audience et convertir vos prospects.', 'Gestion', filiereMap['Gestion'], matiereMap['Gestion:Marketing'], 'Intermédiaire', 175, instructorResult.insertId, 'approved'],
        ['UX & Design', 'Comprenez les principes du design centré utilisateur et améliorez vos interfaces.', 'Divers', filiereMap['Divers'], matiereMap['Divers:Design'], 'Avancé', 98, instructorResult.insertId, 'approved']
      ]]
    );

    await connection.query(
      'INSERT INTO exams (course_id, title, description, duration, instructor_id) VALUES ? ',
      [[
        [1, 'Quiz HTML/CSS', 'Évaluez vos connaissances sur les fondamentaux du web.', '30 min', instructorResult.insertId],
        [2, 'Stratégie marketing', 'Testez votre capacité à construire une campagne digitale.', '45 min', instructorResult.insertId]
      ]]
    );

    await connection.query(
      'INSERT INTO reports (user_id, type, message) VALUES ? ',
      [[[studentResult.insertId, 'course', 'Le cours ne se charge pas correctement.' ], [instructorResult.insertId, 'content', 'Une ressource est manquante sur mon cours.']]]
    );
  }

  await connection.query(
    'UPDATE courses c JOIN filieres f ON c.filiere = f.name SET c.filiere_id = f.id WHERE c.filiere_id IS NULL AND c.filiere IS NOT NULL'
  );

  await connection.query(
    'UPDATE courses c JOIN filieres f ON c.filiere_id = f.id OR c.filiere = f.name JOIN matieres m ON m.filiere_id = f.id SET c.matiere_id = m.id WHERE c.matiere_id IS NULL'
  );

  await connection.query(
    'UPDATE users u JOIN filieres f ON u.filiere = f.name JOIN matieres m ON m.filiere_id = f.id SET u.matiere_id = m.id WHERE u.role = "instructor" AND u.matiere_id IS NULL'
  );
};

export const initDb = async () => {
  const tempConnection = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, multipleStatements: true });

  await createDatabase(tempConnection);
  await createTables(tempConnection);
  await seedData(tempConnection);
  await tempConnection.end();

  db = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return db;
};
