"use client";

import { Loader2, AlertCircle } from "lucide-react";

interface UrlFormProps {
  url: string;
  setUrl: (url: string) => void;
  state: "idle" | "loading" | "preview" | "generating_pdf" | "error";
  error: string;
  progressMessage: string;
  onExtract: (e: React.FormEvent) => void;
}

export function UrlForm({ url, setUrl, state, error, progressMessage, onExtract }: UrlFormProps) {
  return (
    <div className="max-w-4xl mx-auto mb-24 animate-fade-in-up delay-100">
      <form onSubmit={onExtract} className="w-full">
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
            {progressMessage}
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
  );
}
