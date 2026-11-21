import { create } from 'zustand';
import { City, Movie, Theater, Showtime, Seat, ViewMode, FoodAddon, HallSchedule } from '../types';
import { CITIES, MOVIES, THEATERS, DATES, FOOD_ADDONS, HALL_SCHEDULES } from '../data/mockData';
import { generateAuditoriumSeats } from '../utils/seatGenerator';

export const MAX_BOOKING_SEATS = 10;

interface BookingState {
  currentCity: City;
  selectedDate: string;
  viewMode: ViewMode;
  previousViewMode: ViewMode;
  selectedMovie: Movie | null;
  selectedTheater: Theater | null;
  selectedShowtime: Showtime | null;
  selectedHall: HallSchedule | null;
  seats: Seat[];
  selectedSeats: Seat[];
  activeSeatFor3D: Seat | null;
  hallwayRoomIndex: number;
  isDoorOpen: boolean;
  foodQuantities: Record<string, number>;
  searchQuery: string;
  selectedFormatFilter: string;
  isMuted: boolean;
  bookingReference: string | null;

  // Actions
  setCity: (cityId: string) => void;
  setDate: (dateId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleHallwayMode: () => void;
  setSearchQuery: (query: string) => void;
  setFormatFilter: (format: string) => void;
  toggleMute: () => void;

  selectMovie: (movie: Movie, targetMode?: ViewMode) => void;
  selectTheaterAndShowtime: (theater: Theater, showtime: Showtime) => void;
  selectHallShowtime: (hall: HallSchedule, movie: Movie, showtime: Showtime) => void;
  toggleSeat: (seatId: string) => void;
  selectPresetSeat: (row: string, col: number) => void;
  setActiveSeatFor3D: (seat: Seat) => void;
  setHallwayRoomIndex: (index: number) => void;
  nextHallwayRoom: () => void;
  prevHallwayRoom: () => void;
  setDoorOpen: (isOpen: boolean) => void;
  updateFoodQuantity: (foodId: string, delta: number) => void;
  
  getSeatsSubtotal: () => number;
  getFoodSubtotal: () => number;
  getConvenienceFee: () => number;
  getGrandTotal: () => number;

  completeBooking: () => void;
  resetSelection: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentCity: CITIES[0],
  selectedDate: DATES[0].id,
  viewMode: (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode') as ViewMode;
      if (['grid', 'hallway3d', 'theaters', 'seats', 'seat3d', 'checkout', 'ticket'].includes(m)) {
        return m;
      }
    }
    return 'grid';
  })(),
  previousViewMode: 'grid',
  selectedMovie: MOVIES[0],
  selectedTheater: THEATERS[0],
  selectedShowtime: THEATERS[0].showtimes[2], // 19:45 IMAX
  selectedHall: HALL_SCHEDULES[0],
  seats: generateAuditoriumSeats(),
  selectedSeats: (() => {
    const fresh = generateAuditoriumSeats();
    const sweetSpot = fresh.find((s) => s.id === 'F-8');
    return sweetSpot ? [{ ...sweetSpot, status: 'selected' as const }] : [];
  })(),
  activeSeatFor3D: (() => {
    const fresh = generateAuditoriumSeats();
    return fresh.find((s) => s.id === 'F-8') || null;
  })(),
  hallwayRoomIndex: 0,
  isDoorOpen: (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('open') === '1' || params.get('open') === 'true';
    }
    return false;
  })(),
  foodQuantities: {},
  searchQuery: '',
  selectedFormatFilter: 'All',
  isMuted: true,
  bookingReference: null,

  setCity: (cityId) => {
    const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
    set({ currentCity: city });
  },

  setDate: (dateId) => set({ selectedDate: dateId }),

  setViewMode: (mode) =>
    set((state) => ({
      previousViewMode: state.viewMode,
      viewMode: mode,
    })),

  toggleHallwayMode: () =>
    set((state) => {
      const isCurrentlyHallway = state.viewMode === 'hallway3d';
      return {
        previousViewMode: state.viewMode,
        viewMode: isCurrentlyHallway ? 'grid' : 'hallway3d',
        isDoorOpen: false,
      };
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFormatFilter: (format) => set({ selectedFormatFilter: format }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  selectMovie: (movie, targetMode = 'theaters') => {
    // Also sync hallway room index
    const roomIdx = MOVIES.findIndex((m) => m.id === movie.id);
    set({
      selectedMovie: movie,
      hallwayRoomIndex: roomIdx >= 0 ? roomIdx : 0,
      viewMode: targetMode,
      isDoorOpen: false,
    });
  },

  selectTheaterAndShowtime: (theater, showtime) => {
    // Generate fresh seats
    const freshSeats = generateAuditoriumSeats();
    set({
      selectedTheater: theater,
      selectedShowtime: showtime,
      seats: freshSeats,
      selectedSeats: [],
      activeSeatFor3D: null,
      viewMode: 'seats',
    });
  },

  selectHallShowtime: (hall, movie, showtime) => {
    const freshSeats = generateAuditoriumSeats();
    // Synthesize a theater object from the hall information
    const theaterObj: Theater = {
      id: hall.id,
      name: `${hall.name} • ${hall.cinemaName}`,
      location: hall.location,
      distance: hall.distanceLabel,
      formats: [showtime.format],
      amenities: ['M-Ticket', 'Dolby Sound', 'Laser 4K'],
      showtimes: [showtime],
    };

    set({
      selectedHall: hall,
      selectedMovie: movie,
      selectedTheater: theaterObj,
      selectedShowtime: showtime,
      seats: freshSeats,
      selectedSeats: [],
      activeSeatFor3D: null,
      viewMode: 'seats',
      isDoorOpen: false,
    });
  },

  toggleSeat: (seatId) => {
    const { seats, selectedSeats } = get();
    const target = seats.find((s) => s.id === seatId);
    if (!target || target.status === 'sold') return;

    const isAlreadySelected = selectedSeats.some((s) => s.id === seatId);
    let newSelected: Seat[];

    if (isAlreadySelected) {
      newSelected = selectedSeats.filter((s) => s.id !== seatId);
    } else {
      if (selectedSeats.length >= MAX_BOOKING_SEATS) {
        alert(`You can select a maximum of ${MAX_BOOKING_SEATS} seats per booking.`);
        return;
      }
      newSelected = [...selectedSeats, target];
    }

    const updatedSeats = seats.map((s) => {
      if (s.id === seatId) {
        return {
          ...s,
          status: (isAlreadySelected ? 'available' : 'selected') as Seat['status'],
        };
      }
      return s;
    });

    set({
      seats: updatedSeats,
      selectedSeats: newSelected,
      activeSeatFor3D: newSelected.length > 0 ? newSelected[newSelected.length - 1] : null,
    });
  },

  selectPresetSeat: (row, col) => {
    const { seats } = get();
    const key = `${row}-${col}`;
    const target = seats.find((s) => s.id === key);
    if (!target) return;

    // Clear previous and select just this target
    const updatedSeats = seats.map((s) => {
      if (s.id === key) {
        return { ...s, status: 'selected' as const };
      }
      if (s.status === 'selected') {
        return { ...s, status: 'available' as const };
      }
      return s;
    });

    set({
      seats: updatedSeats,
      selectedSeats: [target],
      activeSeatFor3D: target,
    });
  },

  setActiveSeatFor3D: (seat) => set({ activeSeatFor3D: seat }),

  setHallwayRoomIndex: (index) => {
    const totalHalls = HALL_SCHEDULES.length;
    const safeIndex = (index + totalHalls) % totalHalls;
    const hall = HALL_SCHEDULES[safeIndex];
    set({
      hallwayRoomIndex: safeIndex,
      selectedHall: hall,
      selectedMovie: hall.movies[0].movie,
      isDoorOpen: false,
    });
  },

  nextHallwayRoom: () => {
    const { hallwayRoomIndex } = get();
    const totalHalls = HALL_SCHEDULES.length;
    const nextIdx = (hallwayRoomIndex + 1) % totalHalls;
    const hall = HALL_SCHEDULES[nextIdx];
    set({
      hallwayRoomIndex: nextIdx,
      selectedHall: hall,
      selectedMovie: hall.movies[0].movie,
      isDoorOpen: false,
    });
  },

  prevHallwayRoom: () => {
    const { hallwayRoomIndex } = get();
    const totalHalls = HALL_SCHEDULES.length;
    const prevIdx = (hallwayRoomIndex - 1 + totalHalls) % totalHalls;
    const hall = HALL_SCHEDULES[prevIdx];
    set({
      hallwayRoomIndex: prevIdx,
      selectedHall: hall,
      selectedMovie: hall.movies[0].movie,
      isDoorOpen: false,
    });
  },

  setDoorOpen: (isOpen) => set({ isDoorOpen: isOpen }),

  updateFoodQuantity: (foodId, delta) => {
    const current = get().foodQuantities[foodId] || 0;
    const next = Math.max(0, current + delta);
    set((state) => ({
      foodQuantities: {
        ...state.foodQuantities,
        [foodId]: next,
      },
    }));
  },

  getSeatsSubtotal: () => {
    const { selectedSeats, selectedShowtime } = get();
    const multiplier = selectedShowtime?.priceMultiplier || 1.0;
    return Math.round(
      selectedSeats.reduce((acc, seat) => acc + seat.price * multiplier, 0)
    );
  },

  getFoodSubtotal: () => {
    const { foodQuantities } = get();
    return Object.entries(foodQuantities).reduce((acc, [id, qty]) => {
      const item = FOOD_ADDONS.find((f) => f.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);
  },

  getConvenienceFee: () => {
    const { selectedSeats } = get();
    if (selectedSeats.length === 0) return 0;
    // Standard BookMyShow convenience fee (~₹38 per ticket + 18% GST)
    return Math.round(selectedSeats.length * 45);
  },

  getGrandTotal: () => {
    const { getSeatsSubtotal, getFoodSubtotal, getConvenienceFee } = get();
    return getSeatsSubtotal() + getFoodSubtotal() + getConvenienceFee();
  },

  completeBooking: () => {
    const randomRef = 'CV-' + Math.floor(100000 + Math.random() * 900000);
    set({
      bookingReference: randomRef,
      viewMode: 'ticket',
    });
  },

  resetSelection: () => {
    const freshSeats = generateAuditoriumSeats();
    set({
      seats: freshSeats,
      selectedSeats: [],
      activeSeatFor3D: null,
      foodQuantities: {},
      bookingReference: null,
      viewMode: 'grid',
    });
  },
}));
