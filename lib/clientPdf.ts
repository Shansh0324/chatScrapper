"use client";

import { marked } from "marked";

// ─── Markdown → HTML ─────────────────────────────────────────────────────────

function markdownToHtml(markdown: string): string {
  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  return marked.parse(markdown) as string;
}

// ─── PDF Stylesheet (identical to server-side version) ───────────────────────

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

    @page { size: A4; margin: 40px 40px 50px 10px; }

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

    .notebook {
      border-left: 2px solid ${redLine};
      margin-left: 44px;
      padding: 0 36px 0 24px;
    }

    .ruled {
      border-bottom: 1px solid ${ruleLine};
    }

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
    
    .table-of-contents ul { list-style: none; padding-left: 0; }
    .table-of-contents li { border-bottom: 1px solid ${ruleLine}; }
    .table-of-contents a {
      color: ${text};
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 3px;
    }

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

    /* Hide everything except the notebook when printing */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
}

// ─── Build full HTML document ────────────────────────────────────────────────

interface PdfOptions {
  title?: string;
  author?: string;
  theme?: string;
}

function buildHtmlDocument(
  markdownHtml: string,
  platform: string,
  options: PdfOptions
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

// ─── Client-side PDF Generation ──────────────────────────────────────────────
//
// Uses the browser's native print engine to generate PDFs.
// This works on ALL platforms (desktop + mobile) without needing
// Puppeteer or any server-side browser.

export function generatePdfClientSide(
  markdown: string,
  platform: string,
  options: PdfOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const htmlContent = markdownToHtml(markdown);
      const fullHtml = buildHtmlDocument(htmlContent, platform, options);

      // Create a hidden iframe to render the PDF content
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.opacity = "0";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        iframe.remove();
        reject(new Error("Could not create print frame"));
        return;
      }

      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      // Wait for fonts and content to load, then trigger print
      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Clean up the iframe after a short delay
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 1000);
        } catch (printErr) {
          iframe.remove();
          reject(printErr);
        }
      };

      // Give fonts time to load (Google Fonts via @import)
      if (iframe.contentWindow) {
        iframe.contentWindow.onload = () => {
          setTimeout(triggerPrint, 800);
        };
        // Fallback if onload doesn't fire
        setTimeout(triggerPrint, 3000);
      } else {
        setTimeout(triggerPrint, 2000);
      }
    } catch (err) {
      reject(err);
    }
  });
}
