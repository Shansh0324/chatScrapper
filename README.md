# ChatNotes

Turn shared Claude and ChatGPT conversation links into downloadable PDF study notes — with **zero external AI API calls**. All text processing is done locally using a TextRank-based extractive summarization algorithm.

## Features

- **Dual-platform support**: Works with shared links from both Claude.ai and ChatGPT (chatgpt.com / chat.openai.com)
- **Smart scraping**: Cheerio-based fast path with Puppeteer fallback for robust content extraction
- **Local NLP**: TextRank sentence ranking, topic filtering, automatic section detection — no AI APIs
- **Professional PDF output**: Clean typography, styled code blocks, page numbers, metadata header
- **Dark/Light mode**: Fully responsive landing page with theme toggle
- **Rate limiting**: Per-IP request throttling to prevent abuse

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Scraping**: Cheerio (fast path) + Puppeteer (fallback)
- **NLP**: Custom TextRank implementation with built-in stopwords and sentence tokenizer
- **PDF**: Puppeteer PDF rendering with custom stylesheet
- **Icons**: Lucide React
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chatScrapper

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

No external API keys are required. All processing is done locally.

Copy `.env.example` to `.env.local` if needed:

```bash
cp .env.example .env.local
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-notes/
│   │       └── route.ts          # API endpoint: scrape → extract → PDF
│   ├── globals.css               # Design system & animations
│   ├── layout.tsx                # Root layout with fonts & theme
│   └── page.tsx                  # Landing page with form UI
├── components/
│   ├── ThemeProvider.tsx          # next-themes wrapper
│   └── ThemeToggle.tsx           # Dark/light mode toggle
├── lib/
│   ├── scraper.ts                # Conversation scraper (Cheerio + Puppeteer)
│   ├── extractNotes.ts           # TextRank-based notes extraction
│   └── generatePdf.ts           # Markdown → HTML → PDF pipeline
├── next.config.ts
├── package.json
└── README.md
```

## How It Works

1. **Scraping**: The scraper detects the platform from the URL domain. It first tries fetching raw HTML and parsing embedded JSON (like `__NEXT_DATA__`) with Cheerio. If that yields no results, it falls back to Puppeteer to render the page and extract messages from the DOM.

2. **Notes Extraction**: Assistant responses are joined and tokenized into sentences. A TextRank algorithm builds a similarity graph using shared significant words (after stopword removal), runs PageRank-style iterations, and selects top-scoring sentences. These are reordered chronologically, grouped into sections using topic-shift detection, and code blocks are preserved separately.

3. **PDF Generation**: The Markdown notes are converted to HTML with a professional print stylesheet, then rendered to a PDF using Puppeteer with proper margins, page numbers, and a metadata header.

## Deployment on Vercel

### Important: Puppeteer on Serverless

This app uses `puppeteer-core` with `@sparticuz/chromium`, which is specifically designed for serverless environments like Vercel.

**Vercel-specific configuration**:

1. The `@sparticuz/chromium` package automatically provides a compatible Chromium binary in Lambda environments.
2. Set the function's max duration in `vercel.json` if the default (10s on Hobby) is too short:

```json
{
  "functions": {
    "app/api/generate-notes/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

3. On Vercel's **Hobby plan**, the max function duration is 10 seconds, which may be insufficient for Puppeteer-based scraping. Consider upgrading to the **Pro plan** (60s limit) for reliable operation.

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Rate Limiting

The API route implements in-memory rate limiting:
- **5 requests per minute** per IP address
- Returns `429 Too Many Requests` with a `Retry-After` header when exceeded
- Note: In-memory rate limiting resets on cold starts in serverless environments. For production-grade rate limiting, consider using Vercel KV or Upstash Redis.

## License

MIT
