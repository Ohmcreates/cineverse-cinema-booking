export interface City {
  id: string;
  name: string;
  state: string;
  icon: string;
}

export type SeatTierType = 'standard' | 'sweetspot' | 'recliner';

export interface Seat {
  id: string;
  row: string;
  col: number;
  tier: SeatTierType;
  price: number;
  status: 'available' | 'sold' | 'selected';
  x: number; // 3D x-coordinate
  y: number; // 3D y-coordinate (stadium riser height)
  z: number; // 3D z-coordinate (distance back from screen)
}

export interface Movie {
  id: string;
  title: string;
  roomNumber: string;
  tagline: string;
  synopsis: string;
  director: string;
  cast: string[];
  duration: string;
  rating: string;
  votes: string;
  language: string;
  genre: string[];
  formats: string[];
  backdropColor: string;
  posterBg: string;
  accentColor: string;
  japaneseTitle?: string;
  isTrending?: boolean;
  isAfterHoursPick?: boolean;
}

export interface Showtime {
  id: string;
  time: string;
  format: string;
  experience: string;
  availability: 'almost-full' | 'filling-fast' | 'available';
  priceMultiplier: number;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  distance: string;
  formats: string[];
  amenities: string[];
  showtimes: Showtime[];
}

export interface FoodAddon {
  id: string;
  name: string;
  category: 'Popcorn' | 'Snacks' | 'Beverages' | 'Combos';
  price: number;
  desc: string;
  calories?: string;
  isVeg: boolean;
}

export interface HallSchedule {
  id: string;
  hallNumber: string;
  name: string;
  cinemaName: string;
  distanceKm: number;
  distanceLabel: string;
  location: string;
  soundSystem: string;
  movies: {
    movie: Movie;
    schedule: Showtime[];
  }[];
}

export type ViewMode = 
  | 'grid' 
  | 'hallway3d' 
  | 'theaters' 
  | 'seats' 
  | 'seat3d' 
  | 'checkout' 
  | 'ticket';
