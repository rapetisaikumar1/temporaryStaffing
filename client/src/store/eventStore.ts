import { create } from 'zustand';
import { Event, BookingStatus } from '@/types/event.types';

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (updated: Event) => void;
  updateEventStatus: (id: string, status: BookingStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events] })),

  updateEvent: (updated) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === updated.id ? updated : e)),
    })),

  updateEventStatus: (id, status) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, status } : e,
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
