import React from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { CITIES, DATES } from '../../data/mockData';
import { 
  Film, 
  MapPin, 
  Search, 
  Sparkles, 
  Ticket, 
  Volume2, 
  VolumeX, 
  LayoutGrid, 
  Layers3, 
  ChevronDown 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentCity,
    setCity,
    selectedDate,
    setDate,
    viewMode,
    setViewMode,
    toggleHallwayMode,
    searchQuery,
    setSearchQuery,
    selectedSeats,
    getGrandTotal,
    isMuted,
    toggleMute,
  } = useBookingStore();

  const isHallway = viewMode === 'hallway3d';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-obsidian/90 backdrop-blur-xl transition-colors">
      {/* Top utility bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setViewMode('grid')}
            className="group flex items-center space-x-2 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-crimson to-rose-500 shadow-glow-crimson transition-transform group-hover:scale-105">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display text-lg font-black tracking-wider text-cream">
                  CINE<span className="text-crimson">VERSE</span>
                </span>
                <span className="rounded bg-crimson/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-rose-300 border border-crimson/30">
                  Spatial
                </span>
              </div>
              <p className="hidden text-[10px] font-medium text-creamMuted/60 sm:block">
                Cinematic Event & 3D Ticketing
              </p>
            </div>
          </button>

          {/* City selector dropdown */}
          <div className="relative hidden md:block">
            <label htmlFor="city-select" className="sr-only">Select City</label>
            <div className="flex items-center space-x-1.5 rounded-full border border-white/10 bg-charcoal/80 px-3 py-1.5 text-xs text-cream hover:border-white/20 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-crimson" />
              <select
                id="city-select"
                value={currentCity.id}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent font-medium text-cream focus:outline-none cursor-pointer pr-2 text-xs"
              >
                {CITIES.map((city) => (
                  <option key={city.id} value={city.id} className="bg-charcoal text-cream">
                    {city.icon} {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="relative mx-4 hidden max-w-xs flex-1 lg:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-creamMuted/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, formats, IMAX, 4DX..."
            className="w-full rounded-full border border-white/10 bg-charcoal/60 py-1.5 pl-9 pr-4 text-xs text-cream placeholder-creamMuted/40 transition-all focus:border-crimson focus:bg-charcoal focus:outline-none focus:ring-1 focus:ring-crimson"
          />
        </div>

        {/* Right: Dual-Mode Switch & Cart status */}
        <div className="flex items-center space-x-3">
          {/* Audio toggle button */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-charcoal/70 text-creamMuted hover:text-cream hover:border-white/20 transition"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emeraldLight" />}
          </button>

          {/* DUAL-MODE TOGGLE SWITCH */}
          <button
            onClick={toggleHallwayMode}
            className={`relative flex items-center space-x-2 rounded-full p-1 pl-2.5 pr-3 text-xs font-semibold transition-all duration-300 shadow-md ${
              isHallway
                ? 'bg-gradient-to-r from-plum via-purple-900 to-indigo-950 text-white border border-purple-400/40 shadow-[0_0_20px_rgba(91,55,72,0.6)]'
                : 'bg-charcoal/90 text-cream border border-white/15 hover:border-white/30'
            }`}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform ${
              isHallway ? 'bg-purple-400 text-obsidian rotate-12' : 'bg-crimson/20 text-rose-300'
            }`}>
              {isHallway ? <Layers3 className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
            </div>
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-creamMuted/80 leading-none">
                {isHallway ? 'Immersive Mode' : 'Standard Mode'}
              </span>
              <span className="text-[11px] font-bold tracking-wide flex items-center gap-1">
                {isHallway ? '3D Hallway Active' : 'Explore 3D Hallway'}
                {!isHallway && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
                )}
              </span>
            </div>
          </button>

          {/* Active Cart Pill */}
          {selectedSeats.length > 0 && (
            <button
              onClick={() => setViewMode('checkout')}
              className="flex items-center space-x-2 rounded-full bg-emeraldAccent/20 border border-emeraldAccent/40 px-3 py-1.5 text-xs font-semibold text-emeraldLight hover:bg-emeraldAccent/30 transition shadow-glow-emerald"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} (₹{getGrandTotal()})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Date selector strip (only shown on grid & theater views) */}
      {(viewMode === 'grid' || viewMode === 'theaters') && (
        <div className="border-t border-white/5 bg-charcoal/40 px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-wider text-creamMuted/50 font-bold mr-1">
                Date:
              </span>
              {DATES.map((d) => {
                const isSelected = selectedDate === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDate(d.id)}
                    className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs transition-all ${
                      isSelected
                        ? 'bg-cream text-obsidian font-bold shadow-sm scale-105'
                        : 'text-creamMuted hover:bg-white/5 hover:text-cream font-medium'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-70">{d.day}</span>
                    <span className="text-sm font-black">{d.date}</span>
                    <span className="text-[10px] opacity-70">{d.month}</span>
                    {d.label && (
                      <span className={`rounded px-1 py-0.2 text-[8px] font-bold ${
                        isSelected ? 'bg-crimson text-white' : 'bg-white/10 text-creamMuted'
                      }`}>
                        {d.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden items-center space-x-3 text-xs text-creamMuted md:flex">
              <span className="flex items-center space-x-1 text-emeraldLight">
                <span className="h-2 w-2 rounded-full bg-emeraldAccent animate-ping" />
                <span>Live IMAX Projection in {currentCity.name}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
