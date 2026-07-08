"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Filter, CalendarDays, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EventModal from "@/components/calendar/EventModal";
import { fetchEvents } from "@/lib/redux/slices/calendarSlice";

const categories = [
  { name: "Work", color: "#2563eb", bg: "bg-blue-500", border: "border-blue-500" },
  { name: "Personal", color: "#16a34a", bg: "bg-green-500", border: "border-green-500" },
  { name: "Meeting", color: "#8b5cf6", bg: "bg-purple-500", border: "border-purple-500" },
  { name: "Finance", color: "#f59e0b", bg: "bg-amber-500", border: "border-amber-500" },
  { name: "Important", color: "#dc2626", bg: "bg-red-500", border: "border-red-500" }
];

// Dynamically import FullCalendar component to avoid SSR errors
const CalendarComponent = dynamic(
  () => import("@/components/calendar/CalendarComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center bg-surface border border-border rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-text-muted">Loading Calendar...</span>
        </div>
      </div>
    ),
  }
);

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { events, status } = useSelector((state) => state.calendar);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Category filters
  const [activeFilters, setActiveFilters] = useState({
    Work: true,
    Personal: true,
    Meeting: true,
    Finance: true,
    Important: true,
  });

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleAddEventClick = () => {
    setSelectedEvent(null);
    setSelectedSlot({
      start: new Date().toISOString(),
      allDay: false
    });
    setIsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent(null);
    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (eventInfo) => {
    setSelectedSlot(null);
    setSelectedEvent(eventInfo);
    setIsModalOpen(true);
  };

  const toggleFilter = (categoryName) => {
    setActiveFilters((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Filter events based on active checkboxes
  const filteredEvents = (events || []).filter(
    (event) => activeFilters[event.category]
  );

  // Get top 5 upcoming events (future start dates)
  const upcomingEvents = (events || [])
    .filter((event) => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  // Format date helper for the widget
  const formatWidgetDate = (dateStr, allDay) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return {
      dayLabel: `${dayName}, ${dayNum} ${month}`,
      timeLabel: allDay ? "All Day" : time
    };
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1400px] mx-auto w-full h-full pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main">Calendar</h1>
          <p className="text-xs text-text-muted mt-1">Manage, organize, and schedule your events</p>
        </div>
        <Button onClick={handleAddEventClick} className="flex gap-2 font-bold py-2.5 shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
          {/* Filters Card */}
          <Card className="p-5">
            <h3 className="text-sm font-black text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Category Filters
            </h3>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.name}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={activeFilters[cat.name]}
                      onChange={() => toggleFilter(cat.name)}
                      className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${cat.bg}`} />
                </label>
              ))}
            </div>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="p-5 flex-1 w-full">
            <h3 className="text-sm font-black text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Upcoming Events
            </h3>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {upcomingEvents.map((evt) => {
                  const { dayLabel, timeLabel } = formatWidgetDate(evt.start, evt.allDay);
                  const catInfo = categories.find((c) => c.name === evt.category);

                  return (
                    <div
                      key={evt._id}
                      onClick={() => handleSelectEvent(evt)}
                      className="flex items-start gap-3 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 dark:hover:border-primary/40 bg-surface/50 hover:bg-muted/40 cursor-pointer transition-all group duration-200"
                    >
                      {/* Side category line indicator */}
                      <div className={`w-1 self-stretch rounded-full ${catInfo ? catInfo.bg : "bg-primary"}`} />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-text-main truncate group-hover:text-primary transition-colors">
                          {evt.title}
                        </h4>

                        <div className="flex flex-col gap-1 mt-1.5 text-xs text-text-muted font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-text-muted/70" />
                            {dayLabel} • {timeLabel}
                          </span>
                          <span className="capitalize mt-0.5">
                            <Badge variant="ghost" className="px-1.5 py-0.5 text-[10px] bg-muted/60 border-none font-bold">
                              {evt.category}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Calendar Area */}
        <div className="flex-1 w-full">
          <CalendarComponent
            events={filteredEvents}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      {/* Event Add/Edit Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedSlot}
        editData={selectedEvent}
      />
    </div>
  );
}
