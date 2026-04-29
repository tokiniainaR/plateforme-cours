import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'elearning' } = process.env;

const fixAdminRole = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log('🔄 Correction du rôle admin...');

    // Mettre à jour tous les utilisateurs avec role 'student' et filiere 'gestion' qui devraient être admin
    const [result] = await connection.query(`
      UPDATE users
      SET role = 'admin', filiere = NULL, niveau = NULL
      WHERE role = 'student' AND filiere = 'gestion'
    `);

    // Corriger les admins qui ont une filière (les admins ne devraient pas avoir de filière)
    const [result2] = await connection.query(`
      UPDATE users
      SET filiere = NULL, niveau = NULL
      WHERE role = 'admin' AND (filiere IS NOT NULL OR niveau IS NOT NULL)
    `);

    console.log(`✅ ${result2.affectedRows} admin(s) corrigé(s) - filière et niveau supprimés`);

    // Vérifier les comptes admin
    const [admins] = await connection.query('SELECT id, nom, prenom, email, role, filiere FROM users WHERE role = "admin"');
    console.log('📋 Comptes admin actuels:', admins);

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

fixAdminRole();