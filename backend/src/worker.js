const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { pool } = require('./config/database');
const { winstonLogger } = require('./middleware/logger');
const { scrapeMediaFromUrl } = require('./bullmq/scraper'); // Import scraper

// Redis Connection
const connection = new Redis({
  host: process.env.REDIS_HOST || 'redis', // Use Redis service name in Docker
  port: 6379,
  maxRetriesPerRequest: null
});

// Worker Process
const worker = new Worker(
  'scrapeQueue',
  async (job) => {
    const { url } = job.data;
    winstonLogger.info(`Processing: ${url}`);

    const mediaUrls = await scrapeMediaFromUrl(url);

    if (mediaUrls.length > 0) {
      const bulkInsertData = mediaUrls.map((media) => [url, media.url, media.type]);

      try {
        await pool.query(
          'INSERT INTO media_urls (source_url, media_url, media_type) VALUES ?',
          [bulkInsertData]
        );
        winstonLogger.info(`✅ Successfully scraped & saved: ${url}`);
      } catch (dbError) {
        winstonLogger.error(`❌ Database error for ${url}: ${dbError.message}`);
      }
    }

    return mediaUrls.length;
  },
  { connection,
    concurrency: 10},
);

// Log Worker Events
worker.on('completed', (job, result) => {
  winstonLogger.info(`🎯 Job ${job.id} completed: Scraped ${result} media items.`);
});

worker.on('failed', (job, err) => {
  winstonLogger.error(`❌ Job ${job.id} failed: ${err.message}`);
});

console.log('🔧 Worker is listening for jobs...');
