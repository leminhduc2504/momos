const axios = require('axios');
const cheerio = require('cheerio');
const { winstonLogger } = require('../middleware/logger');

const scrapeMediaFromUrl = async (url) => {
    try {
        winstonLogger.info(`Scraping URL: ${url}`);
        
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        const mediaUrls = [];

        $('img').each((_, element) => {
            let src = $(element).attr('src');
            if (src) {
                src = new URL(src, url).href;
                mediaUrls.push({ url: src, type: 'image' });
            }
        });

        $('video source, video').each((_, element) => {
            let src = $(element).attr('src');
            if (src) {
                src = new URL(src, url).href;
                mediaUrls.push({ url: src, type: 'video' });
            }
        });

        winstonLogger.info(`Scraped ${mediaUrls.length} media items from ${url}`);
        return mediaUrls;
    } catch (error) {
        winstonLogger.error(`Error scraping ${url}: ${error.message}`);
        return [];
    }
};

module.exports = { scrapeMediaFromUrl };
