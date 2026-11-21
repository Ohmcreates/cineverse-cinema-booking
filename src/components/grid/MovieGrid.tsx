import React from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { MOVIES } from '../../data/mockData';
import { Movie } from '../../types';
import { 
  Star, 
  Sparkles, 
  Film, 
  Clock, 
  Compass, 
  Layers, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

const FORMAT_FILTERS = ['All', 'IMAX 3D', '4DX', 'Dolby Atmos', 'Arthouse', 'Trending'];

export const MovieGrid: React.FC = () => {
  const {
    selectMovie,
    selectedFormatFilter,
    setFormatFilter,
    searchQuery,
    setViewMode,
    setHallwayRoomIndex,
  } = useBookingStore();

  const featuredMovie = MOVIES[0]; // Paper Moon

  // Filter logic
  const filteredMovies = MOVIES.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      movie.formats.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFormatFilter === 'All') return true;
    if (selectedFormatFilter === 'Trending') return movie.isTrending;
    return movie.formats.some((f) =>
      f.toLowerCase().includes(selectedFormatFilter.toLowerCase())
    ) || movie.genre.some((g) =>
      g.toLowerCase().includes(selectedFormatFilter.toLowerCase())
    );
  });

  const handleOpen3DHallwayForMovie = (movie: Movie) => {
    const idx = MOVIES.findIndex((m) => m.id === movie.id);
    setHallwayRoomIndex(idx >= 0 ? idx : 0);
    setViewMode('hallway3d');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* FEATURED HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-charcoal via-surface to-obsidian p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-crimson/15 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1 rounded-full bg-crimson px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow-crimson">
                <Flame className="h-3 w-3" />
                <span>Featured Showcase</span>
              </span>
              <span className="rounded-full border border-purple-400/30 bg-purple-950/60 px-3 py-1 text-[11px] font-semibold text-purple-200">
                Screening in Room {featuredMovie.roomNumber}
              </span>
              <span className="rounded-full border border-emeraldAccent/30 bg-emeraldAccent/10 px-3 py-1 text-[11px] font-semibold text-emeraldLight">
                3D POV Sightline Available
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-cream">
              {featuredMovie.title}
              {featuredMovie.japaneseTitle && (
                <span className="ml-3 text-lg font-normal text-creamMuted/40 block sm:inline">
                  {featuredMovie.japaneseTitle}
                </span>
              )}
            </h1>

            <p className="text-sm font-medium italic text-amber-200/80">
              "{featuredMovie.tagline}"
            </p>

            <p className="text-xs sm:text-sm text-creamMuted line-clamp-3 leading-relaxed max-w-2xl">
              {featuredMovie.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-creamMuted pt-2">
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{featuredMovie.rating} / 10</span>
                <span className="text-[11px] text-creamMuted/60 font-normal">({featuredMovie.votes} votes)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-creamMuted/60" />
                <span>{featuredMovie.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Film className="h-4 w-4 text-creamMuted/60" />
                <span>Dir. {featuredMovie.director}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => selectMovie(featuredMovie, 'theaters')}
                className="flex items-center space-x-2 rounded-xl bg-crimson px-6 py-3 text-sm font-bold text-white shadow-glow-crimson hover:bg-crimsonHover transition-all hover:scale-[1.02]"
              >
                <span>Book Tickets</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleOpen3DHallwayForMovie(featuredMovie)}
                className="flex items-center space-x-2 rounded-xl border border-purple-400/40 bg-purple-950/40 px-5 py-3 text-sm font-bold text-purple-200 hover:bg-purple-900/60 hover:border-purple-400 transition-all shadow-md"
              >
                <Compass className="h-4 w-4 text-purple-400" />
                <span>Explore in 3D Hallway</span>
              </button>
            </div>
          </div>

          {/* Right mini preview card */}
          <div className="lg:col-span-5 flex justify-center">
            <div 
              onClick={() => handleOpen3DHallwayForMovie(featuredMovie)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-charcoal p-4 shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:border-purple-400/80 max-w-sm w-full"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-stone-900 to-black p-6 flex flex-col justify-between border border-white/10">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-4xl font-black text-amber-200/90 tracking-tighter">
                    {featuredMovie.roomNumber}
                  </span>
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 border border-amber-400/30 uppercase">
                    Arthouse 35mm
                  </span>
                </div>

                <div className="my-auto text-center space-y-2">
                  <div className="mx-auto h-24 w-24 rounded-full border-2 border-amber-200/40 flex items-center justify-center bg-amber-200/10 shadow-inner group-hover:scale-110 transition-transform">
                    <Film className="h-10 w-10 text-amber-200" />
                  </div>
                  <h3 className="font-display text-2xl font-black tracking-wide text-amber-100">
                    PAPER MOON
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-amber-200/60">
                    4K Studio Morrow Remaster
                  </p>
                </div>

                <div className="rounded-lg bg-black/60 p-2 text-center backdrop-blur-md">
                  <p className="text-[10px] font-semibold text-purple-300 flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Click to walk up to Room 01 in 3D</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER PILLS & DISCOVERY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-cream flex items-center gap-2">
            <span>Now Showing in Multiplexes</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-creamMuted">
              {filteredMovies.length} Films
            </span>
          </h2>
          <p className="text-xs text-creamMuted/70 mt-0.5">
            Select any movie for showtimes or enter the 3D corridor for spatial seat previews
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FORMAT_FILTERS.map((f) => {
            const active = selectedFormatFilter === f;
            return (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-crimson text-white shadow-glow-crimson'
                    : 'bg-charcoal text-creamMuted border border-white/10 hover:border-white/20 hover:text-cream'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOVIE GRID CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMovies.map((movie) => {
          return (
            <div
              key={movie.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-charcoal/80 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl"
            >
              {/* Top Room & Format Badges */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 font-mono text-xs font-bold text-cream border border-white/10">
                      {movie.roomNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-creamMuted/70">
                      Auditorium {movie.roomNumber}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    <Star className="h-3 w-3 fill-amber-300" />
                    <span>{movie.rating}</span>
                  </div>
                </div>

                {/* Stylized Poster Graphic Canvas */}
                <div 
                  onClick={() => selectMovie(movie, 'theaters')}
                  className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 p-5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${movie.backdropColor} 0%, #0A0A0C 100%)`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      {movie.genre[0]}
                    </span>
                    {movie.isTrending && (
                      <span className="rounded bg-crimson px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                        Trending
                      </span>
                    )}
                  </div>

                  <div className="my-auto">
                    <h3 className="font-display text-2xl font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] font-medium text-white/60 line-clamp-1 mt-1">
                      {movie.tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {movie.formats.slice(0, 3).map((fmt) => (
                      <span
                        key={fmt}
                        className="rounded bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white/90 backdrop-blur-sm"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Synopsis & Details */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-creamMuted line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-creamMuted/70 border-t border-white/5 pt-2">
                    <span>{movie.language}</span>
                    <span>{movie.duration}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 mt-2">
                <button
                  onClick={() => selectMovie(movie, 'theaters')}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-crimson py-2.5 text-xs font-bold text-white shadow-md hover:bg-crimsonHover transition-all"
                >
                  <span>Book Tickets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleOpen3DHallwayForMovie(movie)}
                  className="flex items-center justify-center space-x-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-cream hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <Compass className="h-3.5 w-3.5 text-purple-400" />
                  <span>3D Hallway</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM CTA: AFTER HOURS 3D HALLWAY TEASER */}
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-surface to-charcoal p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>After Hours Spatial Architecture</span>
          </div>
          <h3 className="font-display text-2xl font-black text-cream">
            Prefer walking down the cinema hallway yourself?
          </h3>
          <p className="text-xs text-creamMuted leading-relaxed">
            Switch into the full 3D interactive corridor. Inspect room doors, backlit poster art, and preview any seat's true 3D field of view before spending a rupee.
          </p>
        </div>

        <button
          onClick={() => setViewMode('hallway3d')}
          className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:brightness-110 transition-all whitespace-nowrap"
        >
          <Layers className="h-4 w-4" />
          <span>Launch 3D Hallway Experience</span>
        </button>
      </div>
    </div>
  );
};
