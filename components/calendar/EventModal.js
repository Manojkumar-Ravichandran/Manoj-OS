"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { addEvent, updateEvent, deleteEvent } from "@/lib/redux/slices/calendarSlice";

const categories = [
  { name: "Work", color: "#2563eb", bg: "bg-blue-500" },
  { name: "Personal", color: "#16a34a", bg: "bg-green-500" },
  { name: "Meeting", color: "#8b5cf6", bg: "bg-purple-500" },
  { name: "Finance", color: "#f59e0b", bg: "bg-amber-500" },
  { name: "Important", color: "#dc2626", bg: "bg-red-500" }
];

export default function EventModal({ isOpen, onClose, selectedDate, editData }) {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [color, setColor] = useState("#16a34a");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper to format date to local datetime string (YYYY-MM-DDTHH:mm) or date string (YYYY-MM-DD)
  const formatForInput = (dateObj, isAllDay = false) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    if (isNaN(date.getTime())) return "";

    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    if (isAllDay) {
      return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setDescription(editData.description || "");
      setCategory(editData.category || "Personal");
      setColor(editData.color || "#16a34a");
      setAllDay(editData.allDay || false);
      setStartDate(formatForInput(editData.start, editData.allDay));
      setEndDate(formatForInput(editData.end || editData.start, editData.allDay));
    } else if (selectedDate) {
      setTitle("");
      setDescription("");
      setCategory("Personal");
      setColor("#16a34a");
      setAllDay(selectedDate.allDay || false);
      setStartDate(formatForInput(selectedDate.start, selectedDate.allDay));

      // Default end date is 1 hour later for time-slots, or same day for all-day
      let end = new Date(selectedDate.start);
      if (!selectedDate.allDay) {
        end.setHours(end.getHours() + 1);
      }
      setEndDate(formatForInput(selectedDate.end || end, selectedDate.allDay));
    }
  }, [editData, selectedDate, isOpen]);

  const handleCategoryChange = (catName) => {
    setCategory(catName);
    const selectedCat = categories.find((c) => c.name === catName);
    if (selectedCat) {
      setColor(selectedCat.color);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build event object
    const startVal = new Date(startDate);
    const endVal = endDate ? new Date(endDate) : new Date(startDate);

    // Validate dates
    if (startVal > endVal) {
      alert("Start date must be before end date.");
      return;
    }

    const eventPayload = {
      title,
      description,
      category,
      color,
      allDay,
      start: startVal.toISOString(),
      end: endVal.toISOString(),
    };

    if (editData) {
      dispatch(updateEvent({ id: editData._id, event: eventPayload }));
    } else {
      dispatch(addEvent(eventPayload));
    }
    onClose();
  };

  const handleDelete = () => {
    if (editData && window.confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(editData._id));
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? "Edit Event" : "Create Event"}
      className="max-w-lg"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Event Title</label>
          <Input
            placeholder="Go for running, Sync up meeting..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full bg-surface border-border/80"
          />
        </div>

        {/* Category Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryChange(cat.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  category === cat.name
                    ? "bg-surface border-text-main shadow-sm scale-[1.02]"
                    : "bg-surface border-border text-text-muted hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${cat.bg}`} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Start / End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Start</label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border/85 bg-surface text-text-main outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">End</label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border/85 bg-surface text-text-main outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center gap-2">
          <input
            id="allDayCheckbox"
            type="checkbox"
            checked={allDay}
            onChange={(e) => {
              const checked = e.target.checked;
              setAllDay(checked);
              // Transform dates to match types
              setStartDate(formatForInput(startDate, checked));
              setEndDate(formatForInput(endDate, checked));
            }}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
          />
          <label htmlFor="allDayCheckbox" className="text-sm font-semibold text-text-muted cursor-pointer select-none">
            All Day Event
          </label>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</label>
          <textarea
            placeholder="Add detailed description or notes here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border/85 bg-surface text-text-main outline-none focus:border-primary transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
          <div>
            {editData && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                className="px-4 font-semibold"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-4 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 font-semibold"
            >
              {editData ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
