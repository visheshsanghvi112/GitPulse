import axios from 'axios';

async function testScraper() {
  try {
    const resp = await axios.get('https://github.com/trending?since=daily', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = resp.data;
    const rowRegex = /<article class="Box-row">([\s\S]*?)<\/article>/g;
    const rows = [...html.matchAll(rowRegex)];
    
    console.log(`Found ${rows.length} rows`);
    
    const trendingMeta = rows.map((match, i) => {
      const rowHtml = match[1];
      // More robust path matching: find href="/owner/repo" but exclude non-repos
      const pathMatch = rowHtml.match(/href="\/([^"\/]+\/[^"\/]+)"/);
      const velocityMatch = rowHtml.match(/([\d,]+ stars (today|this week|this month))/);
      
      const path = pathMatch ? pathMatch[1] : null;
      if (path && (path.startsWith('sponsors/') || path.startsWith('site/'))) return null;

      return {
        index: i + 1,
        path: path,
        velocity: velocityMatch ? velocityMatch[1].trim() : 'NOT FOUND'
      };
    }).filter(Boolean);

    console.log(JSON.stringify(trendingMeta.slice(0, 25), null, 2));
  } catch (err: any) {
    console.error('Test failed:', err.message);
  }
}

testScraper();
