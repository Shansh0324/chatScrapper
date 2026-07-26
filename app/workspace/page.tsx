"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, FileText, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

interface Note {
  _id: string;
  title: string;
  author: string;
  createdAt: string;
  platform: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      const res = await fetch(`/api/notes/${noteToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== noteToDelete));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNoteToDelete(null);
    }
  };

  return (
    <>
      <main className="flex-1 w-[95%] mx-auto pt-12 pb-20 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 border-b-8 border-black pb-6">
          <div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
              Workspace
            </h1>
            <p className="text-2xl text-gray-600 font-semibold">Your saved notes and summaries.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-3 brutal-border brutal-shadow-sm-static bg-white hover:bg-gray-50 text-xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Log Out
            </button>
            <Link 
              href="/"
              className="px-6 py-3 flex items-center gap-2 brutal-border brutal-shadow-sm-static bg-[#ff00ff] hover:bg-[#e600e6] text-xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              New Note
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="brutal-border brutal-shadow-static bg-gray-50 p-12 text-center">
            <FileText className="w-24 h-24 mx-auto mb-6 opacity-20" />
            <h2 className="text-4xl font-black uppercase mb-4">No Notes Yet</h2>
            <p className="text-xl mb-8">You haven't saved any study notes to your workspace.</p>
            <Link 
              href="/"
              className="inline-block px-8 py-4 brutal-border brutal-shadow-sm-static bg-[#ff00ff] hover:bg-[#e600e6] text-2xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Create Your First Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note) => (
              <div key={note._id} className="brutal-border brutal-shadow-static bg-white p-6 flex flex-col h-[250px] relative group hover:bg-[#ff00ff] transition-colors">
                <div className="flex-1">
                  <h3 className="text-3xl font-black uppercase line-clamp-2 mb-2 group-hover:text-white">{note.title || "Untitled Note"}</h3>
                  <p className="text-lg text-gray-600 font-semibold group-hover:text-white line-clamp-1">
                    {note.author ? `By ${note.author}` : "Anonymous"}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t-4 border-black group-hover:border-white flex justify-between items-end">
                  <div className="text-sm font-bold uppercase group-hover:text-white">
                    {new Date(note.createdAt).toLocaleDateString()}
                    {note.platform && <span className="ml-2 px-2 py-0.5 bg-black text-white">{note.platform}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setNoteToDelete(note._id)}
                      className="bg-white p-2 brutal-border hover:bg-[#ffe6e6] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                    <Link 
                      href={`/workspace/${note._id}`}
                      className="bg-white p-2 brutal-border group-hover:shadow-[4px_4px_0_rgba(255,255,255,1)] transition-shadow"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white brutal-border brutal-shadow-static p-8 max-w-md w-full">
            <h3 className="text-3xl font-black uppercase mb-4 text-red-600">Delete Note?</h3>
            <p className="text-xl font-bold mb-8">Are you sure you want to delete this note? This cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setNoteToDelete(null)}
                className="flex-1 py-4 brutal-border bg-gray-100 hover:bg-gray-200 text-xl font-black uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 brutal-border brutal-shadow-sm-static bg-red-600 hover:bg-red-700 text-white text-xl font-black uppercase transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
