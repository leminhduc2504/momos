const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { scrapeUrls, getMediaUrls } = require('../controllers/scraperController');

router.use(authenticateToken); 
router.post('/scrape', scrapeUrls);
router.get('/media', getMediaUrls);

module.exports = router;