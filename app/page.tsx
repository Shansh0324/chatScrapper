"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/Hero").then((mod) => mod.Hero));
const UrlForm = dynamic(() => import("@/components/UrlForm").then((mod) => mod.UrlForm));
const HowItWorks = dynamic(() => import("@/components/HowItWorks").then((mod) => mod.HowItWorks));
const PricingSection = dynamic(() => import("@/components/PricingSection").then((mod) => mod.PricingSection));
const SettingsSidebar = dynamic(() => import("@/components/SettingsSidebar").then((mod) => mod.SettingsSidebar));
const PreviewPane = dynamic(() => import("@/components/PreviewPane").then((mod) => mod.PreviewPane));

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

  const [state, setState] = useState<AppState>("idle");
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [extractedMarkdown, setExtractedMarkdown] = useState("");
  const [extractedPlatform, setExtractedPlatform] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState("");

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

      // Attempt to save note to workspace (fails silently if not logged in)
      try {
        const saveRes = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: title.trim() || "Generated Note", 
            author: author.trim() || "", 
            markdown: data.markdown, 
            platform: data.platform 
          }),
        });
        if (saveRes.ok) {
          const savedData = await saveRes.json();
          setCurrentNoteId(savedData.note._id);
        }
      } catch (e) {
        // Ignore if fails (e.g. not authenticated)
      }

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
      const sanitizedTitle = title
        ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
        : "study-notes";
      const filename = `chatnotes-${sanitizedTitle}.pdf`;

      // Mobile Safari and some mobile browsers don't support
      // programmatic a.click() on blob URLs. Use window.open()
      // as a fallback for those environments.
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, open the PDF in a new tab — the user can
        // then use the browser's native share/save functionality
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        // Don't revoke immediately — the new tab needs time to load
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
      } else {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }

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
    setCurrentNoteId("");
  };

  return (
    <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20">
      {state === "idle" || state === "loading" || (state === "error" && !extractedMarkdown) ? (
        <>
          <Hero />
          
          <div className="mt-12 sm:mt-24" />
          <UrlForm 
            url={url} 
            setUrl={setUrl} 
            state={state} 
            error={error} 
            progressMessage={PROGRESS_MESSAGES[progressIndex] || "Extracting..."}
            onExtract={handleExtract} 
          />
          
          <div className="mt-24 sm:mt-32" />
          <HowItWorks />
          
          <div className="mt-24 sm:mt-32" />
          <PricingSection />
        </>
      ) : (
        <div className="animate-fade-in flex flex-col lg:flex-row gap-12 max-w-[1600px] mx-auto">
          <SettingsSidebar 
            noteId={currentNoteId}
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            pdfTheme={pdfTheme}
            setPdfTheme={setPdfTheme}
            state={state}
            error={error}
            reset={reset}
            onDownload={handleDownloadPdf}
          />
          <PreviewPane 
            title={title}
            author={author}
            extractedMarkdown={extractedMarkdown}
          />
        </div>
      )}
    </main>
  );
}
