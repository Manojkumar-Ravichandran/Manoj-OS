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
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full pb-12">
      <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">Tags</div>
            <div className="space-y-1">
              <div
                onClick={() => setActiveTag("All")}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${activeTag === "All" ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-text-muted'}`}
              >
                <span className="font-medium">All Notes</span>
                <span className="text-xs">{(notes || []).length}</span>
              </div>
              {tagsList.map((tag) => (
                <div
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${activeTag === tag ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-text-muted'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tag === activeTag ? 'bg-primary' : 'bg-text-muted/30'}`}></div>
                    <span className="font-medium">{tag}</span>
                  </div>
                  <span className="text-xs">{tagCounts[tag] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-lg">{activeTag} Notes</h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Search notes..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center border border-border rounded-md bg-surface p-0.5">
                <button className="p-1.5 bg-muted rounded shadow-sm text-text-main"><Grid className="w-4 h-4" /></button>
                <button className="p-1.5 text-text-muted hover:text-text-main"><List className="w-4 h-4" /></button>
              </div>
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
