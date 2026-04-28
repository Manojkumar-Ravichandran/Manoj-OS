"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { addNote, updateNote, deleteNote } from "@/lib/redux/slices/noteSlice";

export default function NoteModal({ isOpen, onClose, editData = null }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    tag: "Personal",
    content: "",
  });

  const tags = ["Personal", "Finance", "Ideas", "Work", "Health", "Important"];

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        tag: editData.tag,
        content: editData.content,
      });
    } else {
      setFormData({
        title: "",
        tag: "Personal",
        content: "",
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await dispatch(updateNote({ id: editData._id, note: formData })).unwrap();
      } else {
        await dispatch(addNote(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      alert(err || "Failed to save note.");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await dispatch(deleteNote(editData._id)).unwrap();
        onClose();
      } catch (err) {
        alert(err || "Failed to delete note.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editData ? "Edit Note" : "Create New Note"}
      className="max-w-[800px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Title</label>
            <Input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Note title..." 
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Tag</label>
            <select 
              name="tag" 
              value={formData.tag} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange}
            className="flex min-h-[300px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="Write your note here..."
            required
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          {editData && (
            <Button type="button" variant="outline" className="text-danger border-danger/20 hover:bg-danger/10" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editData ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
