import { launchBrowser } from "./lib/browser";

async function run() {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36");
    
    // Enable request interception
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
      req.continue();
    });
    
    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('backend-api') || url.includes('share') || url.includes('conversation')) {
        const type = res.request().resourceType();
        if (type === 'xhr' || type === 'fetch') {
          console.log(`[intercept] Intercepted response for: ${url}`);
          try {
            const text = await res.text();
            if (text.includes('"mapping"') || text.includes('"message"')) {
              console.log(`[intercept] FOUND JSON PAYLOAD! Length: ${text.length}`);
              // Write it out for inspection
              const fs = await import("fs");
              fs.writeFileSync("intercepted.json", text);
            }
          } catch (e) {
            console.log(`[intercept] Failed to read text for ${url}`);
          }
        }
      }
    });

    console.log("Navigating...");
    await page.goto("https://chatgpt.com/share/6a65063f-0e60-83ee-97fa-5ee27b01218c", { waitUntil: "networkidle2", timeout: 30000 });
    
    await new Promise(r => setTimeout(r, 5000)); // wait for api calls
    
  } finally {
    await browser.close();
  }
}

run();
