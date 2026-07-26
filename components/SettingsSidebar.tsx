"use client";

import { Loader2, Download, AlertCircle } from "lucide-react";

interface SettingsSidebarProps {
  noteId?: string;
  title: string;
  setTitle: (title: string) => void;
  author: string;
  setAuthor: (author: string) => void;
  pdfTheme: string;
  setPdfTheme: (theme: string) => void;
  state: "idle" | "loading" | "preview" | "generating_pdf" | "error";
  error: string;
  reset: () => void;
  onDownload: () => void;
}

export function SettingsSidebar({
  noteId,
  title,
  setTitle,
  author,
  setAuthor,
  pdfTheme,
  setPdfTheme,
  state,
  error,
  reset,
  onDownload
}: SettingsSidebarProps) {
  const handleUpdate = async () => {
    if (!noteId) return;
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author }),
      });
    } catch (err) {
      console.error("Failed to update note", err);
    }
  };

  return (
    <div className="lg:w-[400px] shrink-0 w-full flex flex-col">
      <div className="brutal-border brutal-shadow-static p-8 sm:p-10 sticky top-8 bg-white">
        <div className="flex items-end justify-between mb-10 pb-4 border-b-8 border-black">
          <h3 className="text-4xl font-black uppercase leading-none">Settings</h3>
          <button onClick={reset} className="text-lg font-black uppercase underline hover:opacity-70 leading-none mb-1">Start Over</button>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-2xl font-black uppercase mb-4">Title</label>
            <input
              type="text"
              placeholder="DBMS Study Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdate}
              className="w-full px-5 py-5 brutal-border text-2xl font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-2xl font-black uppercase mb-4">Author</label>
            <input
              type="text"
              placeholder="Shashank"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onBlur={handleUpdate}
              className="w-full px-5 py-5 brutal-border text-2xl font-bold outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-2xl font-black uppercase mb-4">Theme</label>
            <select
              value={pdfTheme}
              onChange={(e) => setPdfTheme(e.target.value)}
              className="w-full px-5 py-5 brutal-border text-2xl font-bold uppercase outline-none focus:outline focus:outline-4 focus:outline-[#ff00ff] focus:outline-offset-4 bg-white cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '1rem auto' }}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>

        {state === "error" && error && (
          <div className="mt-8 p-5 brutal-border bg-[#ffe6e6] text-red-600 text-xl font-bold flex gap-3">
            <AlertCircle className="w-8 h-8 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={onDownload}
          disabled={state === "generating_pdf"}
          className="mt-12 w-full flex items-center justify-center gap-4 py-8 px-6 brutal-border brutal-shadow-static mb-2 mr-2 bg-[#ff00ff] hover:bg-[#e600e6]
                     text-3xl font-black uppercase tracking-wider disabled:opacity-60 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none"
        >
          {state === "generating_pdf" ? (
            <div className="flex items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin-slow" />
              <span>WAIT...</span>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Download className="w-10 h-10 shrink-0" />
              <div className="flex flex-col items-center leading-tight">
                <span>DOWNLOAD</span>
                <span>PDF</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
