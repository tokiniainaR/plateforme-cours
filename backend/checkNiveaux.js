import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'elearning'
});

(async () => {
  try {
    console.log('=== NIVEAUX DES COURS ===');
    const [courses] = await pool.query('SELECT id, title, niveau FROM courses');
    courses.forEach(c => {
      console.log(`  Cours ${c.id}: "${c.title}" - Niveau: ${c.niveau}`);
    });

    console.log('\n=== NIVEAU DE L\'ETUDIANT 68 ===');
    const [student] = await pool.query('SELECT niveau FROM users WHERE id = 68');
    if (student.length) {
      console.log(`  Niveau: ${student[0].niveau}`);
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
