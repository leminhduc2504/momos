const { Queue, Worker } = require('bullmq'); 
const { pool } = require('../config/database');
const { winstonLogger } = require('../middleware/logger');

const connection = {
  host: "redis",
  port: 6379,
};

const scrapeQueue = new Queue('scrapeQueue', { connection });

const scrapeUrls = async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs must be provided as a non-empty array' });
    }

    // Add each URL as a job to the queue
    for (const url of urls) {
      await scrapeQueue.add('scrapeJob', { url });
    }

    winstonLogger.info(`✅ Added ${urls.length} jobs to the queue.`);
    res.json({ success: true, message: 'Scraping jobs added to queue', totalJobs: urls.length });

  } catch (error) {
    winstonLogger.error(`❌ Error adding jobs to queue: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMediaUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];

    let query = 'SELECT * FROM media_urls WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM media_urls WHERE 1=1';

    if (type) {
      query += ' AND media_type = ?';
      countQuery += ' AND media_type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (source_url LIKE ? OR media_url LIKE ?)';
      countQuery += ' AND (source_url LIKE ? OR media_url LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, params.length - 2));

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
      },
    });
  } catch (error) {
    winstonLogger.error(`❌ Error retrieving media URLs: ${error.message}`);
    next(error);
  }
};



module.exports = {
  scrapeUrls,
  getMediaUrls,
  scrapeQueue,
};
