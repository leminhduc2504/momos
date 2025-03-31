const puppeteer = require('puppeteer');
const { winstonLogger } = require('../middleware/logger');

const scrapeMediaFromUrl = async (url) => {
    try {
        winstonLogger.info(`Scraping URL: ${url}`);

        const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/google-chrome',args: [ 
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-accelerated-2d-canvas', 
            '--no-first-run', '--no-zygote', 
            '--single-process',   
            '--disable-gpu', 
            '--incognito',
            '--disable-software-rasterizer'
          ],}); 
        const page = await browser.newPage();
        
        await page.goto(url, { waitUntil: 'networkidle2' }); 

        const mediaUrls = await page.evaluate(() => {
            const images = [];
            const videos = [];
            
            const imageElements = document.querySelectorAll('img');
            imageElements.forEach((img) => {
                const src = img.src;
                if (src) {
                    images.push({ url: src, type: 'image' });
                }
            });

            const videoElements = document.querySelectorAll('video, video source');
            videoElements.forEach((video) => {
                const src = video.src || video.querySelector('source')?.src;
                if (src) {
                    videos.push({ url: src, type: 'video' });
                }
            });

            return [...images, ...videos];
        });

        winstonLogger.info(`Scraped ${mediaUrls.length} media items from ${url}`);
        await browser.close();

        return mediaUrls;
    } catch (error) {
        winstonLogger.error(`Error scraping ${url}: ${error.message}`);
        return [];
    }
};

module.exports = { scrapeMediaFromUrl };
