const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { pool } = require('./config/database');
const { winstonLogger } = require('./middleware/logger');
const { scrapeMediaFromUrl } = require('./bullmq/scraper'); 

const connection = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
  maxRetriesPerRequest: null
});

const worker = new Worker(
  'scrapeQueue',
  async (job) => {
    const { url } = job.data;
    winstonLogger.info(`Processing: ${url}`);

    const mediaUrls = await scrapeMediaFromUrl(url);

    if (mediaUrls.length > 0) {
      const bulkInsertData = mediaUrls.flatMap((media) => [url, media.url, media.type]);
    
      try {
        const placeholders = mediaUrls.map(() => '(?, ?, ?)').join(','); // Create (?,?,?) for each row
        await pool.query(
          `INSERT INTO media_urls (source_url, media_url, media_type) VALUES ${placeholders}`,
          bulkInsertData
        );
        winstonLogger.info(`Successfully scraped & saved: ${url}`);
      } catch (dbError) {
        winstonLogger.error(`Database error for ${url}: ${dbError.message}`);
      }
    }

    return mediaUrls.length;
  },
  { connection,
    concurrency: 50},
);

worker.on('completed', (job, result) => {
  winstonLogger.info(`Job ${job.id} completed: Scraped ${result} media items.`);
});

worker.on('failed', (job, err) => {
  winstonLogger.error(`Job ${job.id} failed: ${err.message}`);
});

console.log('Worker is listening for jobs');
