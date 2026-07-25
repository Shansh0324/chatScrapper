import { scrapeConversation } from "./lib/scraper";

async function run() {
  try {
    const url = "https://chatgpt.com/share/6a65063f-0e60-83ee-97fa-5ee27b01218c";
    console.log("Scraping:", url);
    const result = await scrapeConversation(url);
    console.log(`Success! Method: ${result.method}`);
    console.log(`Turns: ${result.turns.length}`);
    console.log("First turn:", JSON.stringify(result.turns[0], null, 2));
    
    // Also test browser launch directly if API wasn't used
    if (result.method !== "api") {
      console.log("Testing PDF generation browser logic...");
      const { generatePdf } = await import("./lib/generatePdf");
      const pdf = await generatePdf("# Test", result.platform);
      console.log("PDF generated successfully, size:", pdf.length);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
