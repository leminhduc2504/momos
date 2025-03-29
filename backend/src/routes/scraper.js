const express = require('express');
const router = express.Router();
const { scrapeUrls, getMediaUrls } = require('../controllers/scraperController');

router.post('/scrape', scrapeUrls);
router.get('/media', getMediaUrls);

module.exports = router;