"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Note {
  _id: string;
  title: string;
  author: string;
  markdown: string;
  platform: string;
  createdAt: string;
}

export default function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes/${id}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Note not found");
      }
      const data = await res.json();
      setNote(data.note);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!note) return;
    setIsDownloading(true);

    try {
      const { generatePdfClientSide } = await import("@/lib/clientPdf");
      await generatePdfClientSide(note.markdown, note.platform, {
        title: note.title,
        author: note.author,
        theme: "light",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !id) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-16 h-16 animate-spin" />
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-12 text-center">
        <h1 className="text-5xl font-black uppercase mb-6">Error</h1>
        <p className="text-2xl mb-8">{error || "Note not found."}</p>
        <Link href="/workspace" className="px-8 py-4 brutal-border brutal-shadow-sm-static bg-[#ff00ff] hover:bg-[#e600e6] text-xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">
          Back to Workspace
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 w-[95%] mx-auto pt-12 pb-20 max-w-5xl">
      <div className="mb-8 flex justify-between items-center">
        <Link 
          href="/workspace"
          className="inline-flex items-center gap-2 px-4 py-2 brutal-border brutal-shadow-sm-static bg-white hover:bg-gray-50 font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Workspace
        </Link>
      </div>

      <div className="brutal-border brutal-shadow-static bg-[#ff00ff] p-8 sm:p-12 mb-12">
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white mb-6">
          {note.title || "Untitled Note"}
        </h1>
        <div className="flex flex-col gap-2 text-xl font-bold uppercase text-black">
          <div>
            <span className="bg-black text-white px-2 py-1 mr-3">AUTHOR:</span> 
            {note.author || "Anonymous"}
          </div>
          <div>
            <span className="bg-black text-white px-2 py-1 mr-3">DATE:</span> 
            {new Date(note.createdAt).toLocaleDateString()}
          </div>
          {note.platform && (
            <div>
              <span className="bg-black text-white px-2 py-1 mr-3">PLATFORM:</span> 
              {note.platform}
            </div>
          )}
        </div>
        
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="mt-8 px-6 py-4 flex items-center gap-3 brutal-border bg-white text-black text-xl font-black uppercase hover:bg-gray-100 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-6 h-6 stroke-[3]" />
              Download PDF
            </>
          )}
        </button>
      </div>

      <div className="bg-white brutal-border brutal-shadow-static p-8 sm:p-12 prose prose-lg sm:prose-xl max-w-none 
        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-black
        prose-h1:text-5xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-8 prose-h1:border-black
        prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-3xl prose-h3:mt-8
        prose-p:font-medium prose-p:text-xl prose-p:leading-relaxed prose-p:mb-8
        prose-a:text-[#ff00ff] prose-a:font-bold prose-a:underline prose-a:decoration-4 prose-a:underline-offset-4 hover:prose-a:text-black
        prose-strong:font-black
        prose-ul:list-square prose-ul:pl-8
        prose-li:text-xl prose-li:font-medium prose-li:mb-3 prose-li:marker:text-black
        prose-blockquote:border-l-8 prose-blockquote:border-black prose-blockquote:bg-gray-50 prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:font-bold prose-blockquote:text-2xl prose-blockquote:not-italic
        prose-pre:border-4 prose-pre:border-black prose-pre:rounded-none prose-pre:bg-gray-900 prose-pre:shadow-[8px_8px_0_rgba(0,0,0,1)]
        prose-code:font-mono prose-code:font-bold prose-code:text-[#ff00ff] prose-code:before:content-none prose-code:after:content-none
        prose-img:border-8 prose-img:border-black prose-img:shadow-[12px_12px_0_rgba(0,0,0,1)] prose-img:my-12
        prose-hr:border-t-[6px] prose-hr:border-black prose-hr:my-12"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {note.markdown}
        </ReactMarkdown>
      </div>
    </main>
  );
}
