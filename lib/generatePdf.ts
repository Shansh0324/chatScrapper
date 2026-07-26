import { marked } from "marked";
import type { Platform } from "./scraper";
import { launchBrowser } from "./browser";

// ─── Markdown → HTML ─────────────────────────────────────────────────────────

function markdownToHtml(markdown: string): string {
  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  return marked.parse(markdown) as string;
}

// ─── PDF Stylesheet ──────────────────────────────────────────────────────────
//
// PERFORMANCE NOTES (why this is designed the way it is):
//
// PDF viewers lag when scrolling if the PDF contains:
//   1. `position: fixed` elements — Puppeteer stamps them onto EVERY page
//   2. `repeating-linear-gradient` / background patterns — embedded as
//      complex vector data per page, re-rendered on every scroll frame
//   3. Heavy external resources (CDN scripts/fonts)
//
// This stylesheet achieves the handwritten notebook look using ONLY:
//   - A handwritten Google Font (Caveat)
//   - Simple `border-bottom` on block elements for ruled lines
//   - A `border-left` on the wrapper for the red margin
//   - Zero background-image, zero position:fixed, zero gradients
//
// Result: tiny PDF file, instant scrolling.
//

function getPdfStyles(theme: string = "light"): string {
  const isDark = theme === "dark";

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const text = isDark ? "#d4d4d4" : "#1e1b4b";
  const headerText = isDark ? "#ffffff" : "#111133";
  const tableBorder = isDark ? "#444444" : "#d1d5db";
  const redLine = isDark ? "#6b2020" : "#e88e8e";
  const ruleLine = isDark ? "#2e2e2e" : "#e2e7ee";
  const codeBg = isDark ? "#2a2a2a" : "#f1f5f9";
  const mutedText = isDark ? "#888888" : "#64748b";

  return `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    @page { size: A4; margin: 0; }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      background: ${bg};
      width: 100%;
    }

    body {
      font-family: 'Caveat', cursive;
      font-size: 16pt;
      line-height: 34px;
      color: ${text};
    }

    /* ── Notebook wrapper ──
       Red margin = simple border-left (one vector line, zero repetition).
       Left padding pushes content past the margin line. */
    .notebook {
      border-left: 2px solid ${redLine};
      margin-left: 44px;
      padding: 0 36px 0 24px;
    }

    /* ── Ruled lines ──
       Instead of background patterns, each block-level element gets a
       bottom border. These are individual vector lines — trivial for
       PDF renderers. The notebook feel comes from the consistent
       line-height + these ruled borders. */

    .ruled {
      border-bottom: 1px solid ${ruleLine};
    }

    /* Header bar */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      height: 34px;
      line-height: 34px;
      margin-bottom: 34px;
      border-bottom: 1px solid ${ruleLine};
      font-size: 12pt;
      color: ${mutedText};
    }

    .pdf-header .brand { font-weight: 700; color: ${headerText}; font-size: 14pt; }

    /* Title Block */
    .title-block {
      margin-bottom: 34px;
      text-align: center;
    }
    .title-block h1 {
      font-size: 32pt;
      line-height: 68px;
      font-weight: 700;
      color: ${headerText};
      text-decoration: underline;
      text-decoration-color: ${redLine};
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
      border-bottom: 1px solid ${ruleLine};
    }
    .title-block .author {
      font-size: 15pt;
      color: ${mutedText};
      line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
    }

    /* Headings */
    h1 {
      font-size: 24pt; font-weight: 700; color: ${headerText};
      margin-top: 34px; line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
    }
    h2 {
      font-size: 20pt; font-weight: 700; color: ${headerText};
      margin-top: 34px; line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
      text-decoration: underline; text-decoration-style: dashed;
      text-underline-offset: 4px; text-decoration-color: ${tableBorder};
    }
    h3 {
      font-size: 17pt; font-weight: 700; color: ${headerText};
      margin-top: 34px; line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
    }

    p {
      line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
      margin: 0;
      padding: 0;
    }

    blockquote {
      border-left: 3px solid ${text};
      padding-left: 16px;
      font-style: italic;
    }
    blockquote p { border-bottom: 1px solid ${ruleLine}; }

    ul, ol { padding-left: 24px; }
    li {
      line-height: 34px;
      border-bottom: 1px solid ${ruleLine};
    }
    
    /* Table of contents */
    .table-of-contents ul { list-style: none; padding-left: 0; }
    .table-of-contents li { border-bottom: 1px solid ${ruleLine}; }
    .table-of-contents a {
      color: ${text};
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 3px;
    }

    /* Tables — tables have their own grid so no ruled lines */
    table {
      width: 100%; border-collapse: collapse;
      font-size: 14pt; margin: 17px 0;
    }
    th, td {
      border: 1px solid ${tableBorder};
      padding: 4px 12px; text-align: left;
      vertical-align: top; line-height: 28px;
    }
    th { background: ${codeBg}; font-weight: 700; color: ${headerText}; }

    /* Code — code blocks have their own background so no ruled lines */
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10pt; background: ${codeBg};
      padding: 1px 5px; border-radius: 3px;
    }
    
    pre {
      background: ${codeBg} !important;
      padding: 12px 16px; border-radius: 6px;
      margin: 17px 0; border: 1px solid ${tableBorder};
      overflow-x: auto; font-size: 9pt; line-height: 20px;
    }
    pre code { background: none; padding: 0; color: inherit; font-size: inherit; }

    hr {
      border: none; border-top: 2px dashed ${tableBorder};
      margin: 33px 0 1px 0;
    }
    em { color: ${mutedText}; }
    strong { font-weight: 700; color: ${headerText}; }
    a { color: #0366d6; text-decoration: none; }

    pre, blockquote, table { page-break-inside: avoid; }
    h1, h2, h3 { page-break-after: avoid; }
  `;
}

// ─── Build full HTML document ────────────────────────────────────────────────

interface DocumentOptions {
  title?: string;
  author?: string;
  theme?: string;
}

function buildHtmlDocument(
  markdownHtml: string,
  platform: Platform | string,
  options: DocumentOptions
): string {
  const platformLabel = platform === "claude" ? "Claude.ai" : "ChatGPT";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const titleBlock = options.title ? `
    <div class="title-block">
      <h1>${options.title}</h1>
      ${options.author ? `<div class="author">Prepared by ${options.author}</div>` : ''}
    </div>
  ` : '';

  // NOTE: No external scripts loaded. highlight.js was removed because:
  //   1. It loads ~500KB from CDN during PDF generation
  //   2. It adds complex <span> trees inside <pre> blocks
  //   3. Both increase PDF file size and rendering cost
  //   4. The handwritten notebook style doesn't need syntax coloring

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || 'ChatNotes'}</title>
  <style>${getPdfStyles(options.theme)}</style>
</head>
<body>
  <div class="notebook">
    <div class="pdf-header">
      <span class="brand">ChatNotes</span>
      <span>Source: ${platformLabel} · ${date}</span>
    </div>
    ${titleBlock}
    <div class="content">
      ${markdownHtml}
    </div>
  </div>
</body>
</html>`;
}

// ─── Generate PDF ────────────────────────────────────────────────────────────

export async function generatePdf(
  markdown: string,
  platform: Platform | string,
  options: DocumentOptions = {}
): Promise<Buffer> {
  const htmlContent = markdownToHtml(markdown);
  const fullHtml = buildHtmlDocument(htmlContent, platform, options);

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    const footerText = options.author ? `Notes by ${options.author}` : `Generated with ChatNotes`;
    const textColor = options.theme === "dark" ? "#64748b" : "#a0a0a0";

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "50px",
        right: "40px",
        bottom: "50px",
        left: "10px",
      },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width: 100%; display: flex; justify-content: space-between; padding: 0 50px; font-size: 8pt; color: ${textColor}; font-family: sans-serif;">
          <span>${footerText}</span>
          <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
