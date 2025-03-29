const mysql = require('mysql2/promise');
const { winstonLogger } = require('../middleware/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'media_scraper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_urls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source_url VARCHAR(2048) NOT NULL,
        media_url VARCHAR(2048) NOT NULL,
        media_type ENUM('image', 'video') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_source_url (source_url(255)),
        INDEX idx_media_type (media_type)
      )
    `);

    connection.release();
    winstonLogger.info('Database setup completed successfully');
  } catch (error) {
    winstonLogger.error('Database setup failed:', error);
    throw error;
  }
}

module.exports = {
  pool,
  setupDatabase
};