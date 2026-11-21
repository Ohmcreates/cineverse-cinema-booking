import React from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { THEATERS, DATES } from '../../data/mockData';
import { Theater, Showtime } from '../../types';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Film,
  Compass
} from 'lucide-react';

export const TheaterSelectModal: React.FC = () => {
  const {
    selectedMovie,
    selectedDate,
    setDate,
    selectTheaterAndShowtime,
    setViewMode,
    currentCity,
    setHallwayRoomIndex,
  } = useBookingStore();

  if (!selectedMovie) return null;

  const handleShowtimeSelect = (theater: Theater, showtime: Showtime) => {
    selectTheaterAndShowtime(theater, showtime);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Navigation & Movie Header */}
      <div className="space-y-6">
        <button
          onClick={() => setViewMode('grid')}
          className="flex items-center space-x-2 text-xs font-semibold text-creamMuted hover:text-cream transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Movie Discovery</span>
        </button>

        {/* Selected Movie Summary Bar */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-charcoal p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div 
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xl font-black text-white shadow-md border border-white/20"
              style={{ backgroundColor: selectedMovie.accentColor }}
            >
              {selectedMovie.roomNumber}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-creamMuted uppercase">
                  {selectedMovie.genre.join(' • ')}
                </span>
                <span className="flex items-center text-xs font-bold text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400 mr-1" />
                  {selectedMovie.rating}
                </span>
              </div>

              <h2 className="font-display text-2xl font-black text-cream mt-0.5">
                {selectedMovie.title}
              </h2>

              <p className="text-xs text-creamMuted/80 flex items-center gap-3 mt-1">
                <span>{selectedMovie.language}</span>
                <span>•</span>
                <span>{selectedMovie.duration}</span>
                <span>•</span>
                <span className="text-emeraldLight">Screening in {currentCity.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setViewMode('hallway3d');
            }}
            className="flex items-center space-x-2 rounded-xl border border-purple-400/40 bg-purple-950/40 px-4 py-2.5 text-xs font-bold text-purple-200 hover:bg-purple-900/60 transition"
          >
            <Compass className="h-4 w-4 text-purple-400" />
            <span>View Room {selectedMovie.roomNumber} in 3D</span>
          </button>
        </div>
      </div>

      {/* Date Switcher */}
      <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {DATES.map((d) => {
            const isSelected = selectedDate === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDate(d.id)}
                className={`flex flex-col items-center justify-center rounded-xl px-4 py-2 text-center transition-all min-w-[70px] ${
                  isSelected
                    ? 'bg-crimson text-white shadow-glow-crimson font-bold scale-105'
                    : 'bg-white/5 text-creamMuted hover:bg-white/10 hover:text-cream'
                }`}
              >
                <span className="text-[10px] uppercase opacity-75">{d.day}</span>
                <span className="text-lg font-black leading-tight">{d.date}</span>
                <span className="text-[9px] opacity-75">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theaters List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
            <span>Available Theaters & Multiplexes</span>
            <span className="text-xs text-creamMuted font-normal">
              ({THEATERS.length} locations near {currentCity.name})
            </span>
          </h3>
          <span className="text-xs text-emeraldLight flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Instant M-Ticket Confirmation</span>
          </span>
        </div>

        {THEATERS.map((theater) => (
          <div
            key={theater.id}
            className="rounded-2xl border border-white/10 bg-charcoal/90 p-5 sm:p-6 shadow-lg space-y-4 hover:border-white/20 transition-colors"
          >
            {/* Theater Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-cream">
                  {theater.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-creamMuted mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-crimson" />
                  <span>{theater.location}</span>
                  <span>•</span>
                  <span className="font-medium text-emeraldLight">{theater.distance}</span>
                </div>
              </div>

              {/* Formats & Amenities */}
              <div className="flex flex-wrap items-center gap-1.5">
                {theater.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-creamMuted uppercase"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Showtimes Row */}
            <div>
              <p className="text-[11px] font-semibold text-creamMuted/70 uppercase tracking-wider mb-2.5">
                Select Showtime to Pick Seats & 3D View:
              </p>

              <div className="flex flex-wrap gap-3">
                {theater.showtimes.map((st) => {
                  let badgeColor = 'border-emeraldAccent/40 text-emeraldLight bg-emeraldAccent/10';
                  if (st.availability === 'filling-fast') {
                    badgeColor = 'border-amber-400/40 text-amber-300 bg-amber-400/10';
                  } else if (st.availability === 'almost-full') {
                    badgeColor = 'border-crimson/40 text-rose-300 bg-crimson/10';
                  }

                  return (
                    <button
                      key={st.id}
                      onClick={() => handleShowtimeSelect(theater, st)}
                      className="group flex flex-col items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 transition-all hover:scale-105 hover:border-crimson hover:bg-crimson/10 hover:shadow-glow-crimson text-left min-w-[100px]"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-sm font-black text-cream group-hover:text-white">
                          {st.time}
                        </span>
                        {st.format.includes('IMAX') && (
                          <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[8px] font-bold text-amber-300 uppercase">
                            IMAX
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[10px] font-medium text-creamMuted group-hover:text-cream">
                          {st.format}
                        </span>
                      </div>

                      <span className={`mt-1.5 rounded-full px-2 py-0.2 text-[8px] font-bold border ${badgeColor}`}>
                        {st.availability === 'available' ? 'Available' : st.availability === 'filling-fast' ? 'Filling Fast' : 'Almost Full'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
