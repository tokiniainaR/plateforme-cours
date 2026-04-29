import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'elearning' } = process.env;

const addSpecialitesColumn = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log('🔄 Ajout de la colonne specialites à la table users...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='specialites'"
    );

    if (columns.length === 0) {
      // Ajouter la colonne si elle n'existe pas
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN specialites JSON NULL COMMENT 'Spécialités/cours enseignés pour les formateurs'
      `);
      console.log('✅ Colonne specialites ajoutée avec succès');
    } else {
      console.log('ℹ️  La colonne specialites existe déjà');
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

addSpecialitesColumn();
