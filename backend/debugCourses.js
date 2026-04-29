import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'elearning' } = process.env;

const debugCourses = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log('🔍 Debug des cours...\n');

    // Vérifier tous les cours
    const [allCourses] = await connection.query(`
      SELECT c.id, c.title, c.statut, c.formateur_id, u.nom, u.prenom, u.role
      FROM courses c
      LEFT JOIN users u ON c.formateur_id = u.id
      ORDER BY c.created_at DESC
    `);

    console.log('📚 Tous les cours dans la base de données:');
    allCourses.forEach(course => {
      console.log(`  - ID: ${course.id}, Titre: "${course.title}", Statut: ${course.statut}, Formateur: ${course.prenom} ${course.nom} (${course.role})`);
    });

    // Vérifier les formateurs
    const [instructors] = await connection.query('SELECT id, nom, prenom, email, role FROM users WHERE role = "instructor"');
    console.log('\n👨‍🏫 Formateurs dans la base:');
    instructors.forEach(inst => {
      console.log(`  - ID: ${inst.id}, Nom: ${inst.prenom} ${inst.nom}, Email: ${inst.email}`);
    });

    // Pour chaque formateur, vérifier ses cours
    for (const inst of instructors) {
      const [instCourses] = await connection.query('SELECT id, title, statut FROM courses WHERE formateur_id = ?', [inst.id]);
      console.log(`\n📖 Cours de ${inst.prenom} ${inst.nom} (ID: ${inst.id}):`);
      if (instCourses.length === 0) {
        console.log('    Aucun cours trouvé');
      } else {
        instCourses.forEach(course => {
          console.log(`    - ID: ${course.id}, Titre: "${course.title}", Statut: ${course.statut}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

debugCourses();