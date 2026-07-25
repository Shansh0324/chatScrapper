import { marked } from "marked";
import type { Platform } from "./scraper";
import { launchBrowser } from "./browser";

// ─── Markdown → HTML ─────────────────────────────────────────────────────────

function markdownToHtml(markdown: string): string {
  // Configure marked for clean output
  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  return marked.parse(markdown) as string;
}

// ─── PDF Stylesheet ──────────────────────────────────────────────────────────

function getPdfStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a2e;
      max-width: 100%;
      padding: 0;
    }

    /* Header bar */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e8e8f0;
      font-size: 9pt;
      color: #6b7280;
    }

    .pdf-header .brand {
      font-weight: 600;
      color: #6d28d9;
      letter-spacing: -0.01em;
    }

    /* Headings */
    h1 {
      font-size: 22pt;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    h2 {
      font-size: 14pt;
      font-weight: 600;
      color: #2d2d44;
      margin-top: 28px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e8e8f0;
      letter-spacing: -0.01em;
    }

    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #3d3d5c;
      margin-top: 20px;
      margin-bottom: 8px;
    }

    /* Paragraphs */
    p {
      margin-bottom: 10px;
    }

    /* Blockquotes (topic focus) */
    blockquote {
      background: #f5f3ff;
      border-left: 3px solid #6d28d9;
      padding: 10px 16px;
      margin: 12px 0;
      border-radius: 0 6px 6px 0;
      font-size: 10pt;
    }

    blockquote strong {
      color: #6d28d9;
    }

    /* Lists */
    ul, ol {
      margin-bottom: 12px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }

    li::marker {
      color: #6d28d9;
    }

    /* Code */
    code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 9.5pt;
      background: #f4f4f8;
      padding: 1px 5px;
      border-radius: 4px;
      color: #5b21b6;
    }

    pre {
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 12px 0 16px;
      overflow-x: auto;
      font-size: 9pt;
      line-height: 1.5;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }

    /* Horizontal rules */
    hr {
      border: none;
      border-top: 1px solid #e8e8f0;
      margin: 20px 0;
    }

    /* Emphasis */
    em {
      color: #6b7280;
      font-style: italic;
    }

    strong {
      font-weight: 600;
      color: #1a1a2e;
    }

    /* Links */
    a {
      color: #6d28d9;
      text-decoration: none;
    }

    /* Page break avoidance for code blocks */
    pre, blockquote {
      page-break-inside: avoid;
    }

    h2, h3 {
      page-break-after: avoid;
    }
  `;
}

// ─── Build full HTML document ────────────────────────────────────────────────

function buildHtmlDocument(
  markdownHtml: string,
  platform: Platform
): string {
  const platformLabel = platform === "claude" ? "Claude.ai" : "ChatGPT";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChatNotes — Study Notes</title>
  <style>${getPdfStyles()}</style>
</head>
<body>
  <div class="pdf-header">
    <span class="brand">ChatNotes</span>
    <span>Source: ${platformLabel} · Generated: ${date}</span>
  </div>
  <div class="content">
    ${markdownHtml}
  </div>
</body>
</html>`;
}

// ─── Generate PDF ────────────────────────────────────────────────────────────

export async function generatePdf(
  markdown: string,
  platform: Platform
): Promise<Buffer> {
  const htmlContent = markdownToHtml(markdown);
  const fullHtml = buildHtmlDocument(htmlContent, platform);

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "60px",
        right: "50px",
        bottom: "60px",
        left: "50px",
      },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width: 100%; text-align: center; font-size: 8pt; color: #a0a0a0; font-family: Inter, sans-serif;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
