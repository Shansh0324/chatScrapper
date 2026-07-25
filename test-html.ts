import { launchBrowser } from "./lib/browser";

async function run() {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36");
    
    console.log("Navigating...");
    await page.goto("https://chatgpt.com/share/6a65063f-0e60-83ee-97fa-5ee27b01218c", { waitUntil: "networkidle2", timeout: 30000 });
    
    await page.waitForSelector('[data-message-author-role]', { timeout: 15000 });
    
    // Also wait for markdown rendering
    await new Promise(r => setTimeout(r, 2000));
    
    const messages = await page.evaluate(() => {
      const results: any[] = [];
      document.querySelectorAll('[data-message-author-role]').forEach(el => {
        const role = el.getAttribute("data-message-author-role");
        const mdEl = el.querySelector(".markdown, .whitespace-pre-wrap, [class*='markdown']");
        results.push({
          role,
          html: mdEl ? mdEl.innerHTML : el.innerHTML
        });
      });
      return results;
    });

    const fs = await import("fs");
    fs.writeFileSync("test-html-output.json", JSON.stringify(messages, null, 2));
    console.log(`Saved ${messages.length} messages to test-html-output.json`);
    
  } finally {
    await browser.close();
  }
}

run();
