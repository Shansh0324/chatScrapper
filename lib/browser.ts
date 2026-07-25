import puppeteer, { type Browser } from "puppeteer-core";

async function getExecutablePath(): Promise<string> {
  const isServerless =
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.VERCEL ||
    !!process.env.AWS_EXECUTION_ENV;

  if (isServerless) {
    try {
      const chromium = (await import("@sparticuz/chromium")).default;
      return await chromium.executablePath();
    } catch (err) {
      console.log("[browser] @sparticuz/chromium not available:", err);
    }
  }

  const possiblePaths =
    process.platform === "win32"
      ? [
          process.env.CHROME_PATH,
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        ]
      : process.platform === "darwin"
        ? [
            process.env.CHROME_PATH,
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          ]
        : [
            process.env.CHROME_PATH,
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
          ];

  for (const p of possiblePaths) {
    if (p) {
      try {
        const fs = await import("fs");
        if (fs.existsSync(p)) {
          console.log(`[browser] Using local Chrome: ${p}`);
          return p;
        }
      } catch {
        // continue
      }
    }
  }

  throw new Error(
    "No Chrome/Chromium found. Install Chrome or set CHROME_PATH environment variable."
  );
}

export async function launchBrowser(): Promise<Browser> {
  const isServerless =
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.VERCEL ||
    !!process.env.AWS_EXECUTION_ENV;

  let chromiumArgs: string[] = [];

  if (isServerless) {
    try {
      const chromium = (await import("@sparticuz/chromium")).default;
      chromiumArgs = chromium.args;
    } catch {
      // fallback args
    }
  }

  if (chromiumArgs.length === 0) {
    chromiumArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
    ];
  }

  const executablePath = await getExecutablePath();

  return puppeteer.launch({
    args: chromiumArgs,
    defaultViewport: { width: 1280, height: 900 },
    executablePath,
    headless: true,
  });
}
