import React from 'react';
import { useBookingStore } from './store/useBookingStore';
import { Navbar } from './components/navigation/Navbar';
import { MovieGrid } from './components/grid/MovieGrid';
import { CinemaHallway3D } from './components/hallway3d/CinemaHallway3D';
import { TheaterSelectModal } from './components/theaters/TheaterSelectModal';
import { SeatMap2D } from './components/seats/SeatMap2D';
import { AuditoriumSeatPreview3D } from './components/auditorium3d/AuditoriumSeatPreview3D';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { DigitalMTicket } from './components/ticket/DigitalMTicket';
import { Film, Compass, Layers3, Sparkles } from 'lucide-react';

export function App() {
  const { viewMode, setViewMode } = useBookingStore();

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col font-sans selection:bg-crimson selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {viewMode === 'grid' && <MovieGrid />}
        {viewMode === 'hallway3d' && <CinemaHallway3D />}
        {viewMode === 'theaters' && <TheaterSelectModal />}
        {viewMode === 'seats' && <SeatMap2D />}
        {viewMode === 'seat3d' && <AuditoriumSeatPreview3D />}
        {viewMode === 'checkout' && <CheckoutModal />}
        {viewMode === 'ticket' && <DigitalMTicket />}
      </main>

      {/* Footer (only shown on grid and ticket views) */}
      {(viewMode === 'grid' || viewMode === 'ticket') && (
        <footer className="border-t border-white/10 bg-charcoal/60 py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-creamMuted/70">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-crimson text-white">
                <Film className="h-3.5 w-3.5" />
              </div>
              <span className="font-display font-bold text-cream">CINEVERSE SPATIAL TICKETING</span>
              <span>• Multiplex & Arthouse Network</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('hallway3d')}
                className="flex items-center space-x-1.5 text-purple-300 hover:text-purple-200 transition"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Launch After Hours 3D Hallway</span>
              </button>
              <span>•</span>
              <span>Powered by Three.js & WebGL</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
