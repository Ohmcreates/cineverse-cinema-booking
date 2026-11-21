import React, { useState } from 'react';
import { useBookingStore, MAX_BOOKING_SEATS } from '../../store/useBookingStore';
import { ROWS, COLS_PER_ROW } from '../../utils/seatGenerator';
import { Seat } from '../../types';
import { soundManager } from '../../utils/soundEffects';
import { 
  ArrowLeft, 
  Eye, 
  Sparkles, 
  Info, 
  Check, 
  Compass, 
  CreditCard,
  ChevronRight,
  Flame,
  Crown,
  Users
} from 'lucide-react';

export const SeatMap2D: React.FC = () => {
  const {
    selectedMovie,
    selectedTheater,
    selectedShowtime,
    seats,
    selectedSeats,
    toggleSeat,
    selectPresetSeat,
    setViewMode,
    getGrandTotal,
    getSeatsSubtotal,
    setActiveSeatFor3D,
    isMuted,
  } = useBookingStore();

  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  if (!selectedMovie || !selectedTheater || !selectedShowtime) return null;

  const handleOpen3DView = (seat?: Seat) => {
    if (seat) {
      setActiveSeatFor3D(seat);
    } else if (selectedSeats.length > 0) {
      setActiveSeatFor3D(selectedSeats[selectedSeats.length - 1]);
    } else {
      // Default to sweet spot F8
      const sweetSpot = seats.find((s) => s.id === 'F-8');
      if (sweetSpot) {
        selectPresetSeat('F', 8);
      }
    }
    setViewMode('seat3d');
  };

  const handleSeatClick = (seat: Seat) => {
    soundManager.playSeatClick(seat.tier, isMuted);
    toggleSeat(seat.id);
  };

  // Quick auto-picker for 1, 2, 3, 4 seats in sweet spot
  const handleAutoPickSeats = (count: number) => {
    const candidateRows = ['F', 'G', 'E', 'D', 'H'];
    for (const r of candidateRows) {
      const rowSeats = seats.filter((s) => s.row === r && s.status !== 'sold');
      for (let i = 0; i <= rowSeats.length - count; i++) {
        const slice = rowSeats.slice(i, i + count);
        // Verify they are sequential columns
        const isSequential = slice.every((s, idx) => idx === 0 || s.col === slice[idx - 1].col + 1);
        if (isSequential && slice.length === count) {
          // Deselect existing
          selectedSeats.forEach((s) => toggleSeat(s.id));
          // Select this slice
          slice.forEach((s) => toggleSeat(s.id));
          setActiveSeatFor3D(slice[0]);
          return;
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <button
            onClick={() => setViewMode('theaters')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-creamMuted hover:text-cream transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Showtime</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-black text-cream">
              {selectedMovie.title}
            </h2>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-creamMuted uppercase">
              Hall {selectedMovie.roomNumber}
            </span>
          </div>
          <p className="text-xs text-creamMuted mt-0.5">
            {selectedTheater.name} • <span className="font-mono text-emeraldLight font-bold">{selectedShowtime.time}</span> ({selectedShowtime.format})
          </p>
        </div>

        {/* 3D POV Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpen3DView()}
            className="flex items-center space-x-2 rounded-xl border border-emeraldAccent/40 bg-emeraldAccent/15 px-4 py-2.5 text-xs font-bold text-emeraldLight hover:bg-emeraldAccent/25 hover:border-emeraldLight shadow-glow-emerald transition-all hover:scale-105"
          >
            <Eye className="h-4 w-4 animate-pulse text-emeraldLight" />
            <span>3D Seat Sightline Preview</span>
          </button>
        </div>
      </div>

      {/* QUICK TICKET AUTO-PICKER */}
      <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cream flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>Quick Ticket Quantity:</span>
            </span>
            <span className="rounded-full bg-emeraldAccent/15 border border-emeraldAccent/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emeraldLight">
              Max {MAX_BOOKING_SEATS} Tickets
            </span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => handleAutoPickSeats(n)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition flex-shrink-0 ${
                  selectedSeats.length === n
                    ? 'bg-crimson text-white shadow-glow-crimson scale-105'
                    : 'bg-white/5 text-creamMuted hover:bg-white/10 hover:text-cream border border-white/10'
                }`}
                title={`Auto-select ${n} adjacent seats`}
              >
                {n} {n === 1 ? 'Seat' : n === 10 ? 'Max (10)' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OLED CURVED CINEMA SCREEN INDICATOR WITH AMBIENT PROJECTOR GLOW */}
      <div className="relative py-4 text-center">
        <div className="mx-auto h-2.5 w-4/5 rounded-t-full bg-gradient-to-r from-transparent via-white to-transparent shadow-glow-screen opacity-95" />
        <div className="mx-auto -mt-1 h-10 w-3/4 rounded-t-[120px] bg-gradient-to-b from-white/15 to-transparent blur-md pointer-events-none animate-pulse" />
        <p className="mt-2 font-mono text-[11px] font-bold tracking-[0.35em] uppercase text-creamMuted/80 flex items-center justify-center gap-2">
          <span>CURVED IMAX LASER CANVAS</span>
        </p>
      </div>

      {/* SEAT GRID LAYOUT WITH GENTLE STADIUM CURVATURE */}
      <div className="relative overflow-x-auto pb-6 pt-2">
        <div className="mx-auto min-w-[640px] max-w-2xl space-y-2.5">
          {ROWS.map((row, rowIndex) => {
            return (
              <div key={row} className="flex items-center justify-center space-x-2">
                {/* Row label left */}
                <span className="w-5 text-center font-mono text-xs font-bold text-creamMuted/70">
                  {row}
                </span>

                {/* Left Aisle (Cols 1-3) */}
                <div className="flex space-x-1.5">
                  {[1, 2, 3].map((col) => {
                    const seat = seats.find((s) => s.row === row && s.col === col);
                    return renderSeatButton(seat);
                  })}
                </div>

                {/* Aisle gap */}
                <div className="w-4 text-center text-[10px] text-creamMuted/30">•</div>

                {/* Center Aisle (Cols 4-11) */}
                <div className="flex space-x-1.5">
                  {[4, 5, 6, 7, 8, 9, 10, 11].map((col) => {
                    const seat = seats.find((s) => s.row === row && s.col === col);
                    return renderSeatButton(seat);
                  })}
                </div>

                {/* Aisle gap */}
                <div className="w-4 text-center text-[10px] text-creamMuted/30">•</div>

                {/* Right Aisle (Cols 12-14) */}
                <div className="flex space-x-1.5">
                  {[12, 13, 14].map((col) => {
                    const seat = seats.find((s) => s.row === row && s.col === col);
                    return renderSeatButton(seat);
                  })}
                </div>

                {/* Row label right */}
                <span className="w-5 text-center font-mono text-xs font-bold text-creamMuted/70">
                  {row}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOVER TOOLTIP FLOATING STATUS */}
      <div className="h-6 text-center text-xs">
        {hoveredSeat ? (
          <span className="font-mono font-medium text-cream inline-flex items-center gap-2 bg-charcoal px-3 py-1 rounded-full border border-white/10 shadow-sm animate-in fade-in">
            <span className="font-bold text-emeraldLight">Row {hoveredSeat.row} · Seat {hoveredSeat.col}</span>
            <span>•</span>
            <span className="uppercase text-[10px] text-creamMuted">{hoveredSeat.tier}</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">₹{hoveredSeat.price}</span>
            <span className="text-[10px] text-creamMuted/60">(Click to toggle)</span>
          </span>
        ) : (
          <span className="text-[11px] text-creamMuted/50">
            Hover over any seat for tier details or click to select
          </span>
        )}
      </div>

      {/* SEAT LEGEND & PRICING TIERS */}
      <div className="rounded-2xl border border-white/10 bg-charcoal/60 p-4">
        <div className="flex flex-wrap items-center justify-around gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-6 rounded-md bg-[#2A2E35] border border-white/20" />
            <span className="text-creamMuted font-medium">Standard (₹350)</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-5 w-6 rounded-md bg-[#2A2E35] border border-emerald-500/40" />
            <span className="text-emeraldLight/90 font-medium">Sweet Spot (₹500)</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-5 w-6 rounded-md bg-[#8B4553] border border-rose-400/40" />
            <span className="text-rose-200 font-medium">Recliner VIP (₹850)</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-5 w-6 rounded-md bg-emeraldAccent shadow-glow-emerald flex items-center justify-center font-mono text-[9px] font-bold text-obsidian">
              ✓
            </div>
            <span className="text-emeraldLight font-bold">Selected</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-5 w-6 rounded-md border border-white/20 bg-transparent opacity-40 flex items-center justify-center text-[8px] text-white/40">
              ✕
            </div>
            <span className="text-creamMuted/50 font-medium">Sold</span>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BOTTOM TRAY */}
      {selectedSeats.length > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto max-w-3xl rounded-2xl border border-white/20 bg-charcoal/95 p-4 shadow-2xl backdrop-blur-2xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-cream">
                  Selected Seats ({selectedSeats.length}/{MAX_BOOKING_SEATS}):
                </span>
                {selectedSeats.length >= MAX_BOOKING_SEATS && (
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Max 10 Limit Reached
                  </span>
                )}
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    className="inline-flex items-center rounded-lg bg-emeraldAccent/20 border border-emeraldAccent/40 px-2 py-0.5 font-mono text-xs font-bold text-emeraldLight"
                  >
                    {seat.row}{seat.col}
                  </span>
                ))}
              </div>
              <p className="text-xs text-creamMuted">
                Subtotal: <span className="font-mono font-bold text-cream">₹{getSeatsSubtotal()}</span> (+₹{selectedSeats.length * 45} fee) = <span className="font-mono font-bold text-emeraldLight">₹{getGrandTotal()}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => handleOpen3DView(selectedSeats[selectedSeats.length - 1])}
                className="flex items-center space-x-2 rounded-xl border border-emeraldAccent/50 bg-emeraldAccent/15 px-4 py-2.5 text-xs font-bold text-emeraldLight hover:bg-emeraldAccent/25 hover:border-emeraldAccent transition shadow-glow-emerald"
              >
                <Eye className="h-4 w-4" />
                <span>View in 3D</span>
              </button>

              <button
                onClick={() => setViewMode('checkout')}
                className="flex items-center space-x-2 rounded-xl bg-crimson px-6 py-2.5 text-xs font-bold text-white shadow-glow-crimson hover:bg-crimsonHover transition hover:scale-105"
              >
                <span>Proceed to Pay (₹{getGrandTotal()})</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderSeatButton(seat?: Seat) {
    if (!seat) return <div key={Math.random()} className="h-6 w-7" />;

    const isSold = seat.status === 'sold';
    const isSelected = seat.status === 'selected';
    const isRecliner = seat.tier === 'recliner';
    const isSweetSpot = seat.tier === 'sweetspot';

    // Gentle stadium curvature transform
    const curvePx = Math.abs(seat.col - 7.5) * 1.2;

    let baseClass = 'h-6 w-7 sm:h-7 sm:w-8 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-all duration-200 ';

    if (isSelected) {
      baseClass += 'bg-emeraldAccent text-obsidian shadow-glow-emerald scale-110 z-10 border border-emerald-300 ring-2 ring-emeraldLight/50';
    } else if (isSold) {
      baseClass += 'border border-white/10 bg-transparent text-white/20 cursor-not-allowed';
    } else if (isRecliner) {
      baseClass += 'bg-[#8B4553] text-white/80 hover:bg-[#A35262] border border-rose-400/30 hover:scale-105';
    } else if (isSweetSpot) {
      baseClass += 'bg-[#2A2E35] text-cream/80 hover:bg-[#3A3F49] border border-emerald-500/30 hover:scale-105';
    } else {
      baseClass += 'bg-[#20242B] text-cream/70 hover:bg-[#2D333D] border border-white/10 hover:scale-105';
    }

    return (
      <button
        key={seat.id}
        disabled={isSold}
        onClick={() => handleSeatClick(seat)}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        style={{ transform: `translateY(${curvePx}px)` }}
        title={`Seat ${seat.row}${seat.col} (${seat.tier.toUpperCase()}) - ₹${seat.price}`}
        className={baseClass}
      >
        {isSelected ? seat.col : isSold ? '' : seat.col}
      </button>
    );
  }
};
