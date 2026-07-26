"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Link2,
  Search,
  ClipboardList,
  AlertCircle,
  Loader2,
  Download,
  Menu,
  X
} from "lucide-react";

type AppState = "idle" | "loading" | "preview" | "generating_pdf" | "error";

const PROGRESS_MESSAGES = [
  "Validating your link…",
  "Fetching the conversation…",
  "Extracting message turns…",
  "Formatting study notes…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pdfTheme, setPdfTheme] = useState("light");
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [state, setState] = useState<AppState>("idle");
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [extractedMarkdown, setExtractedMarkdown] = useState("");
  const [extractedPlatform, setExtractedPlatform] = useState("");

  const startProgress = () => {
    setProgressIndex(0);
    progressInterval.current = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 2000);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setState("loading");
    setError("");
    startProgress();

    try {
      const res = await fetch("/api/extract-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), topic: topic.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setExtractedMarkdown(data.markdown);
      setExtractedPlatform(data.platform);

      stopProgress();
      setState("preview");
    } catch (err) {
      stopProgress();
      setState("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleDownloadPdf = async () => {
    setState("generating_pdf");
    setError("");

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: extractedMarkdown,
          platform: extractedPlatform,
          title: title.trim() || undefined,
          author: author.trim() || undefined,
          theme: pdfTheme,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const sanitizedTitle = title
        ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
        : "study-notes";
      a.download = `chatnotes-${sanitizedTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setState("preview");
    } catch (err) {
      setState("preview");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const reset = () => {
    setState("idle");
    setUrl("");
    setTopic("");
    setTitle("");
    setAuthor("");
    setError("");
    setProgressIndex(0);
    setExtractedMarkdown("");
  };

  return (
    <div className="min-h-screen flex flex-col font-bold bg-white text-black">
      {/* ── Header ── */}
      <header className="w-full pt-8 px-6 sm:px-12 flex items-center justify-between gap-6 relative z-10">
        <div className="text-5xl sm:text-6xl logo-text drop-shadow-[6px_6px_0_rgba(0,0,0,1)] relative z-50">
          <span className="logo-chat">Chat</span>
          <span className="logo-notes">Notes</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4">
          {["Home", "How it Works", "Pricing", "Log In"].map((item) => (
            <button key={item} className="px-5 py-3 brutal-border brutal-shadow-sm-static bg-white text-lg font-black uppercase whitespace-nowrap hover:bg-gray-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">
              {item}
            </button>
          ))}
          <button className="px-6 py-3 brutal-border brutal-shadow-sm-static bg-[#ff00ff] text-lg font-black uppercase whitespace-nowrap hover:bg-[#e600e6] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">
            Get Started
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-3 brutal-border brutal-shadow-sm-static bg-white relative z-50 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>

        {/* Mobile Nav Overlay */}
        <div 
          className={`fixed inset-0 bg-[#ff00ff] z-40 flex flex-col justify-center items-center transition-transform duration-300 ease-out border-b-[12px] border-black ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0, 1, 0, 1)" }}
        >
          <nav className="flex flex-col items-center gap-6 mt-16 w-full px-8">
            {["Home", "How it Works", "Pricing", "Log In"].map((item) => (
              <button 
                key={item} 
                className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-white text-3xl font-black uppercase hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </button>
            ))}
            <button 
              className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-black text-white text-3xl font-black uppercase hover:bg-gray-800 active:translate-y-1 active:translate-x-1 active:shadow-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20">
        {state === "idle" || state === "loading" || (state === "error" && !extractedMarkdown) ? (
          <>
            {/* Hero */}
            <div className="text-center mb-16 animate-fade-in-up">
              <h1 
                className="text-6xl sm:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.95] mx-auto max-w-[95%]"
                style={{ WebkitTextStroke: "3px black" }}
              >
                Instantly turn Web URLs<br/>into Summarized Notes.
              </h1>
            </div>

            {/* Input Section */}
            <div className="max-w-4xl mx-auto mb-24 animate-fade-in-up delay-100">
              <form onSubmit={handleExtract} className="w-full">
                <div className="flex flex-col sm:flex-row p-3 brutal-border brutal-shadow-static bg-white gap-3 focus-within:outline focus-within:outline-4 focus-within:outline-[#ff00ff] focus-within:outline-offset-4">
                  <input
                    type="url"
                    placeholder="Enter website URL (e.g., https://article.com/page)..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={state === "loading"}
                    required
                    className="flex-1 px-4 py-4 text-xl sm:text-2xl font-semibold bg-transparent outline-none placeholder:text-gray-500 placeholder:font-semibold disabled:opacity-60 border-b-4 border-gray-400 focus:border-black transition-colors self-center mr-4"
                  />
                  <button
                    type="submit"
                    disabled={state === "loading" || !url.trim()}
                    className="px-8 py-4 brutal-border brutal-shadow-sm-static mb-1 mr-1 bg-[#ff00ff] text-black text-xl sm:text-2xl font-black uppercase tracking-wide hover:bg-[#e600e6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center min-w-[200px]"
                  >
                    {state === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin-slow" />
                    ) : (
                      "GET NOTES"
                    )}
                  </button>
                </div>

                {/* Progress / Error */}
                {state === "loading" && (
                  <div className="mt-6 text-center text-xl font-bold animate-pulse">
                    {PROGRESS_MESSAGES[progressIndex] || "Extracting..."}
                  </div>
                )}
                {state === "error" && error && (
                  <div className="mt-6 p-4 brutal-border bg-[#ffe6e6] text-red-600 text-xl font-bold flex items-center justify-center gap-3">
                    <AlertCircle className="w-6 h-6" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            </div>

            {/* How it works */}
            <div className="animate-fade-in-up delay-200">
              <h2 className="text-4xl sm:text-5xl font-black text-center uppercase tracking-wide mb-12">
                HOW CHATNOTES WORKS
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
                      1.
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase">PASTE URL</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <Link2 className="w-20 h-20 mb-8 stroke-[3]" />
                    <p className="text-xl sm:text-2xl font-semibold leading-snug">
                      Copy the URL of any web page, article, or video link into the input box above.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
                      2.
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase">ANALYZE</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <Search className="w-20 h-20 mb-8 stroke-[3]" />
                    <p className="text-xl sm:text-2xl font-semibold leading-snug">
                      ChatNotes processes the content using advanced AI to capture key insights and details.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="brutal-border brutal-shadow-static bg-white p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black shrink-0">
                      3.
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase">GET NOTES</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <ClipboardList className="w-20 h-20 mb-8 stroke-[3]" />
                    <p className="text-xl sm:text-2xl font-semibold leading-snug">
                      Receive concise, organized, and structured notes and summaries instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ── Preview & Download State ── */
          <div className="animate-fade-in flex flex-col lg:flex-row gap-12">
            {/* Sidebar Controls */}
            <div className="lg:w-1/3 flex flex-col gap-8">
              <div className="brutal-border brutal-shadow-static p-8 sticky top-8 bg-white">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
                  <h3 className="text-3xl font-black uppercase">Settings</h3>
                  <button onClick={reset} className="text-lg font-bold uppercase underline hover:opacity-70">Start Over</button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-black uppercase mb-3">Title</label>
                    <input
                      type="text"
                      placeholder="DBMS Study Guide"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 brutal-border text-lg font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-black uppercase mb-3">Author</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-3 brutal-border text-lg font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-black uppercase mb-3">Theme</label>
                    <select
                      value={pdfTheme}
                      onChange={(e) => setPdfTheme(e.target.value)}
                      className="w-full px-4 py-3 brutal-border text-lg font-bold uppercase outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4 bg-white"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                </div>

                {state === "error" && error && (
                  <div className="mt-6 p-4 brutal-border bg-[#ffe6e6] text-red-600 text-lg font-bold flex gap-3">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleDownloadPdf}
                  disabled={state === "generating_pdf"}
                  className="mt-10 w-full flex items-center justify-center gap-3 px-6 py-5 brutal-border brutal-shadow bg-[#ff00ff] hover:bg-[#e600e6]
                             text-2xl font-black uppercase tracking-wider disabled:opacity-60 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none"
                >
                  {state === "generating_pdf" ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin-slow" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <Download className="w-8 h-8" />
                      DOWNLOAD PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Markdown Preview */}
            <div className="lg:w-2/3">
              <div className="brutal-border brutal-shadow-static p-8 sm:p-12 prose prose-lg sm:prose-2xl max-w-none bg-white font-semibold">
                <div className="mb-12 text-center pb-8 border-b-4 border-black">
                  <h1 className="text-5xl sm:text-6xl font-black uppercase mb-4 tracking-tight">{title || 'STUDY NOTES'}</h1>
                  {author && <p className="text-2xl font-bold uppercase text-gray-600">BY {author}</p>}
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {extractedMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
