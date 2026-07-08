"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { updateEvent } from "@/lib/redux/slices/calendarSlice";

export default function CalendarComponent({ events, onSelectSlot, onSelectEvent }) {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);

  // Format events to FullCalendar's structure
  const formattedEvents = events.map((e) => ({
    id: e._id,
    title: e.title,
    start: e.start,
    end: e.end || e.start,
    allDay: e.allDay,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: {
      description: e.description,
      category: e.category,
    },
  }));

  // Handle Event Drag & Drop or Resize
  const handleEventChange = (info) => {
    const { event } = info;

    const updatedPayload = {
      title: event.title,
      description: event.extendedProps.description,
      category: event.extendedProps.category,
      color: event.backgroundColor,
      allDay: event.allDay,
      start: event.start.toISOString(),
      end: event.end ? event.end.toISOString() : event.start.toISOString(),
    };

    dispatch(updateEvent({ id: event.id, event: updatedPayload }))
      .unwrap()
      .catch((err) => {
        console.error("Failed to update event position:", err);
        info.revert(); // revert to previous position if DB update fails
      });
  };

  // Open Edit Modal when event clicked
  const handleEventClick = (info) => {
    const { event } = info;
    const dbEvent = events.find((e) => e._id === event.id);
    if (dbEvent) {
      onSelectEvent(dbEvent);
    }
  };

  // Open Create Modal when date/time range is selected
  const handleSelect = (info) => {
    onSelectSlot({
      start: info.startStr,
      end: info.endStr,
      allDay: info.allDay,
    });
  };

  return (
    <div className="w-full h-full bg-surface text-text-main rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={formattedEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: "short",
        }}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        height="auto"
      />
    </div>
  );
}
