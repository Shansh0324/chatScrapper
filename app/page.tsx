"use client";

import { useState, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Link2,
  FileText,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  RotateCcw,
} from "lucide-react";

type AppState = "idle" | "loading" | "success" | "error";

const PROGRESS_MESSAGES = [
  "Validating your link…",
  "Fetching the conversation…",
  "Extracting message turns…",
  "Analyzing content…",
  "Building study notes…",
  "Generating your PDF…",
  "Almost done…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    setProgressIndex(0);
    progressInterval.current = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setState("loading");
    setError("");
    startProgress();

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), topic: topic.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `chatnotes-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      stopProgress();
      setState("success");
    } catch (err) {
      stopProgress();
      setState("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const reset = () => {
    setState("idle");
    setUrl("");
    setTopic("");
    setError("");
    setProgressIndex(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              ChatNotes
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-20 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              100% local processing — no AI APIs
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Turn AI conversations
              <br />
              into{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                study notes
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Paste a shared Claude or ChatGPT conversation link and instantly
              get downloadable, well-organized study notes as a PDF.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="pb-12 sm:pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up delay-200">
              {[
                {
                  icon: Link2,
                  step: "1",
                  title: "Paste a link",
                  desc: "Share a Claude or ChatGPT conversation link",
                },
                {
                  icon: FileText,
                  step: "2",
                  title: "We extract notes",
                  desc: "Key concepts are identified and organized",
                },
                {
                  icon: Download,
                  step: "3",
                  title: "Download PDF",
                  desc: "Get clean, print-ready study notes",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl p-5 border text-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg-card)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "var(--color-accent-light)" }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: "var(--color-accent)" }}
                    />
                  </div>
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Step {item.step}
                  </div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="pb-24 sm:pb-32 px-4 sm:px-6">
          <div className="max-w-xl mx-auto animate-fade-in-up delay-300">
            <div
              className="rounded-2xl border p-6 sm:p-8 shadow-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              {state === "success" ? (
                /* ── Success State ── */
                <div className="text-center py-6 animate-fade-in">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "var(--color-accent-light)" }}
                  >
                    <CheckCircle2 className="w-7 h-7" style={{ color: "var(--color-success)" }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Notes downloaded!
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                    Your PDF study notes have been saved. Check your downloads folder.
                  </p>
                  <button
                    onClick={reset}
                    className="focus-ring inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                               transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Generate another
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit}>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                    htmlFor="url-input"
                  >
                    Conversation link
                  </label>
                  <input
                    id="url-input"
                    type="url"
                    placeholder="https://claude.ai/share/... or https://chatgpt.com/share/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={state === "loading"}
                    required
                    className="focus-ring w-full px-4 py-3 rounded-xl border text-sm placeholder:opacity-50
                               transition-colors duration-200 disabled:opacity-60"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg-input)",
                      color: "var(--color-text-primary)",
                    }}
                  />

                  <label
                    className="block text-sm font-medium mt-4 mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                    htmlFor="topic-input"
                  >
                    Focus on topic{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    id="topic-input"
                    type="text"
                    placeholder="e.g. React hooks, recursion, SQL joins…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={state === "loading"}
                    className="focus-ring w-full px-4 py-3 rounded-xl border text-sm placeholder:opacity-50
                               transition-colors duration-200 disabled:opacity-60"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg-input)",
                      color: "var(--color-text-primary)",
                    }}
                  />

                  {/* Error banner */}
                  {state === "error" && error && (
                    <div
                      className="mt-4 flex items-start gap-3 p-3.5 rounded-xl text-sm animate-fade-in"
                      style={{
                        backgroundColor: "var(--color-error-bg)",
                        color: "var(--color-error)",
                        border: "1px solid var(--color-error)",
                        borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)",
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading" || !url.trim()}
                    className="focus-ring mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                               text-sm font-semibold transition-all duration-200
                               hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60
                               disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                    }}
                  >
                    {state === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin-slow" />
                        {PROGRESS_MESSAGES[progressIndex]}
                      </>
                    ) : (
                      <>
                        Generate notes
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Platform support note */}
            <p
              className="text-center text-xs mt-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              Supports shared links from{" "}
              <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Claude.ai
              </span>
              {" "}and{" "}
              <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
                ChatGPT
              </span>
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="border-t py-6 px-4 text-center text-xs"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        Built with Next.js • All processing done locally
      </footer>
    </div>
  );
}
