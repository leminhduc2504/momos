require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { setupDatabase, pool } = require('./config/database');
const { loggerMiddleware } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const scraperRoutes = require('./routes/scraper');
const authRoutes = require('./routes/auth');
const scrapeQueue = require('./controllers/scraperController'); 
const Redis = require('ioredis');
const { createBullBoard } = require('bull-board');
const { BullMQAdapter } = require('bull-board/bullMQAdapter');

const app = express();
const PORT = process.env.PORT || 3001;

const redisConnection = new Redis({
  host: 'redis',
  port: 6379,
});

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/api/scraper', scraperRoutes);
app.use('/api/auth', authRoutes);
app.get('/ping', (req, res) => res.send('pong'));

const { router: bullBoardRouter } = createBullBoard([
  new BullMQAdapter(scrapeQueue),
]);
app.use('/admin/queues', bullBoardRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Bull Board: http://localhost:${PORT}/admin/queues`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdownServer() {
  await redisConnection.quit(); 
  await pool.end(); 
  process.exit(0);
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);

startServer();
