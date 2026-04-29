import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'elearning' } = process.env;

const addFilesColumnToExams = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log('🔄 Vérification des colonnes content et files dans la table exams...');

    const [contentColumns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='exams' AND COLUMN_NAME='content'"
    );
    if (contentColumns.length === 0) {
      await connection.query(`
        ALTER TABLE exams
        ADD COLUMN content TEXT NULL COMMENT 'Contenu de l examen'
      `);
      console.log('✅ Colonne content ajoutée avec succès');
    } else {
      console.log('ℹ️  La colonne content existe déjà');
    }

    const [filesColumns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='exams' AND COLUMN_NAME='files'"
    );
    if (filesColumns.length === 0) {
      await connection.query(`
        ALTER TABLE exams
        ADD COLUMN files JSON NULL COMMENT 'Chemins des fichiers uploadés pour l examen'
      `);
      console.log('✅ Colonne files ajoutée avec succès');
    } else {
      console.log('ℹ️  La colonne files existe déjà');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

addFilesColumnToExams();