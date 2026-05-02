"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, List, Grid } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import NoteModal from "@/components/notes/NoteModal";
import { fetchNotes } from "@/lib/redux/slices/noteSlice";

const tagsList = ["Personal", "Finance", "Ideas", "Work", "Health", "Important"];

export default function NotesPage() {
  const dispatch = useDispatch();
  const { notes, status } = useSelector((state) => state.note);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleNoteClick = (note) => {
    setEditData(note);
    setIsModalOpen(true);
  };

  const handleAddNote = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const filteredNotes = (notes || []).filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTag === "All" || note.tag === activeTag;
    return matchesSearch && matchesTag;
  });

  const tagCounts = (notes || []).reduce((acc, note) => {
    acc[note.tag] = (acc[note.tag] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1400px] mx-auto w-full h-full pb-12">
      <div className="flex flex-col xl:flex-row gap-6 items-start mt-2">
        {/* Sidebar / Tags */}
        <div className="w-full xl:w-64 shrink-0 flex flex-col gap-6">
          <div className="xl:block">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 px-3">Categories</div>
            <div className="flex xl:flex-col gap-1 overflow-x-auto no-scrollbar xl:overflow-visible pb-2 xl:pb-0 px-2 xl:px-0">
              <div
                onClick={() => setActiveTag("All")}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all whitespace-nowrap ${activeTag === "All" ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-muted text-text-muted'}`}
              >
                <span className="font-bold">All Notes</span>
                <span className={`text-[10px] ml-2 ${activeTag === 'All' ? 'opacity-70' : 'opacity-40'}`}>{(notes || []).length}</span>
              </div>
              {tagsList.map((tag) => (
                <div
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all whitespace-nowrap ${activeTag === tag ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-muted text-text-muted'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tag}</span>
                  </div>
                  <span className={`text-[10px] ml-2 ${activeTag === tag ? 'opacity-70' : 'opacity-40'}`}>{tagCounts[tag] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-xl tracking-tight text-text-main">{activeTag} Notes</h2>
              <Button onClick={handleAddNote} className="sm:hidden gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Search notes..."
                  className="pl-9 h-10 md:h-11 bg-surface/50 border-border/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNote} className="hidden sm:flex gap-2 h-10 md:h-11 px-6">
                <Plus className="w-4 h-4" /> Add Note
              </Button>
            </div>
          </div>

          {status === 'loading' ? (
            <div className="p-12 text-center text-text-muted">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="text-text-muted">No notes found.</div>
              <Button variant="outline" className="mt-4" onClick={handleAddNote}>Create your first note</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card
                  key={note._id}
                  onClick={() => handleNoteClick(note)}
                  className="p-5 flex flex-col hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <h3 className="font-semibold text-lg text-text-main mb-2 group-hover:text-primary transition-colors line-clamp-1">{note.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="primary" className="bg-primary/10 text-primary border-none">{note.tag}</Badge>
                    <span className="text-[10px] text-text-muted uppercase font-semibold">
                      {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted whitespace-pre-line leading-relaxed line-clamp-4">
                    {note.content}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editData}
      />
    </div>
  );
}
