import React from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  Film, 
  Sparkles, 
  QrCode, 
  Ticket,
  ArrowRight
} from 'lucide-react';

export const DigitalMTicket: React.FC = () => {
  const {
    selectedMovie,
    selectedTheater,
    selectedShowtime,
    selectedSeats,
    selectedDate,
    bookingReference,
    getGrandTotal,
    resetSelection,
  } = useBookingStore();

  if (!selectedMovie || !selectedTheater || !selectedShowtime) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 space-y-8 animate-in fade-in duration-500">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emeraldAccent/20 border border-emeraldAccent/40 shadow-glow-emerald">
          <CheckCircle2 className="h-8 w-8 text-emeraldLight" />
        </div>
        <h2 className="font-display text-3xl font-black text-cream">
          See you at the movies.
        </h2>
        <p className="text-xs text-creamMuted">
          Your booking is confirmed! An SMS & email M-Ticket has been dispatched.
        </p>
      </div>

      {/* LUXURY EDITORIAL M-TICKET PASS */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-charcoal to-[#181822] shadow-2xl">
        {/* Top Header of Ticket */}
        <div 
          className="p-6 text-white border-b border-white/10"
          style={{ background: `linear-gradient(135deg, ${selectedMovie.backdropColor} 0%, #141418 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Film className="h-4 w-4 text-amber-300" />
              <span className="font-display text-sm font-black tracking-widest text-cream uppercase">
                CINEVERSE • PASS
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300">
              {bookingReference || 'CV-849201'}
            </span>
          </div>

          <div className="mt-4">
            <span className="rounded bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white uppercase backdrop-blur-sm">
              {selectedShowtime.format}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-cream mt-1">
              {selectedMovie.title}
            </h3>
            <p className="text-xs text-white/70 italic mt-0.5">
              "{selectedMovie.tagline}"
            </p>
          </div>
        </div>

        {/* Notches for authentic ticket perforation */}
        <div className="relative flex items-center justify-between px-6 py-2">
          <div className="absolute -left-3 top-1/2 -mt-3 h-6 w-6 rounded-full bg-obsidian border-r border-white/20" />
          <div className="w-full border-t border-dashed border-white/20" />
          <div className="absolute -right-3 top-1/2 -mt-3 h-6 w-6 rounded-full bg-obsidian border-l border-white/20" />
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-creamMuted/70 block">
                AUDITORIUM & HALL
              </span>
              <span className="font-mono text-sm font-bold text-cream">
                Room {selectedMovie.roomNumber}
              </span>
              <span className="text-[11px] text-creamMuted/80 block mt-0.5">
                {selectedTheater.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-creamMuted/70 block">
                DATE & SHOWTIME
              </span>
              <span className="font-mono text-sm font-bold text-emeraldLight">
                {selectedShowtime.time}
              </span>
              <span className="text-[11px] text-creamMuted/80 block mt-0.5">
                {selectedDate} • {selectedMovie.duration}
              </span>
            </div>
          </div>

          {/* Reserved Seats Row */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-creamMuted block">
                CONFIRMED SEATS ({selectedSeats.length})
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-lg bg-emeraldAccent/20 border border-emeraldAccent/40 px-2.5 py-1 font-mono text-sm font-black text-emeraldLight"
                  >
                    {s.row}{s.col}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-creamMuted block">
                TOTAL PAID
              </span>
              <span className="font-display text-xl font-black text-cream">
                ₹{getGrandTotal()}
              </span>
            </div>
          </div>

          {/* QR Code & Barcode Verification */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-3">
              {/* Procedural SVG QR Code */}
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                <svg viewBox="0 0 100 100" className="h-full w-full fill-black">
                  <rect x="0" y="0" width="30" height="30" fill="black" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="black" />
                  <rect x="70" y="0" width="30" height="30" fill="black" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />
                  <rect x="0" y="70" width="30" height="30" fill="black" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />
                  <rect x="40" y="20" width="20" height="10" fill="black" />
                  <rect x="45" y="45" width="15" height="15" fill="black" />
                  <rect x="70" y="70" width="10" height="25" fill="black" />
                  <rect x="85" y="70" width="10" height="10" fill="black" />
                </svg>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-creamMuted block">
                  Scan at Hall Entrance
                </span>
                <span className="font-mono text-xs text-cream/80">
                  {bookingReference}-AUTH-VALID
                </span>
                <span className="text-[10px] text-emeraldLight block mt-0.5">
                  ✓ Verified by CINEVERSE M-Ticket
                </span>
              </div>
            </div>

            {/* Stylized Barcode */}
            <div className="flex flex-col items-end">
              <div className="flex h-8 items-stretch space-x-1 opacity-70">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, i) => (
                  <div
                    key={i}
                    className="bg-white"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-creamMuted/50 mt-1">
                4829 1049 2048 1192
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            alert('M-Ticket downloaded to your device as PDF/Wallet Pass.');
          }}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-white/20 bg-charcoal/90 py-3 text-xs font-bold text-cream hover:bg-white/10 hover:border-white/30 transition shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span>Save to Apple Wallet / PDF</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${selectedMovie.title} - CINEVERSE Ticket`,
                text: `I'm watching ${selectedMovie.title} at ${selectedTheater.name} in Room ${selectedMovie.roomNumber}!`,
                url: window.location.href,
              });
            } else {
              alert('Ticket link copied to clipboard!');
            }
          }}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-white/20 bg-charcoal/90 py-3 text-xs font-bold text-cream hover:bg-white/10 hover:border-white/30 transition shadow-lg"
        >
          <Share2 className="h-4 w-4" />
          <span>Share with Friends</span>
        </button>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={resetSelection}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-crimson hover:underline"
        >
          <span>Book Another Movie / Explore 3D Hallway</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
