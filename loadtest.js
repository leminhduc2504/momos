import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 5000, 
  iterations: 5000, 
};

export default function () {
  let url = 'http://localhost:3001/api/scraper/scrape';
  let payload = JSON.stringify({
    urls: ['https://www.w3schools.com/html/html_images.asp'],
  });

  let params = {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzQzMzQ1ODQ1LCJleHAiOjE3NDMzODkwNDV9.2gmHj0dQ-ZR2NsEN67BjLQM6yvr-_viKEKiEpu169vE',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
  };

  let res = http.post(url, payload, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.1);
}
