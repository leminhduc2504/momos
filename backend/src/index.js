require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { setupDatabase, pool } = require('./config/database');
const { loggerMiddleware } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const scraperRoutes = require('./routes/scraper');
const scrapeQueue = require('./controllers/scraperController'); // Import BullMQ Queue
const Redis = require('ioredis');
const { createBullBoard } = require('bull-board');
const { BullMQAdapter } = require('bull-board/bullMQAdapter');

const app = express();
const PORT = process.env.PORT || 3001;

const redisConnection = new Redis({
  host: 'redis',
  port: 6379,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use('/api/scraper', scraperRoutes);
app.get('/ping', (req, res) => res.send('pong'));

// Bull Board UI for Monitoring Queue
const { router: bullBoardRouter } = createBullBoard([
  new BullMQAdapter(scrapeQueue),
]);
app.use('/admin/queues', bullBoardRouter);

// Error handling middleware
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Bull Board: http://localhost:${PORT}/admin/queues`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
async function shutdownServer() {
  console.log('🛑 Shutting down server...');
  await redisConnection.quit(); // Close Redis connection
  await pool.end(); // Close database connection
  process.exit(0);
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);

startServer();
