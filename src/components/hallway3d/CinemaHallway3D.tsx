import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBookingStore } from '../../store/useBookingStore';
import { HALL_SCHEDULES } from '../../data/mockData';
import { Movie, HallSchedule, Showtime } from '../../types';
import { createPosterTexture, createHallSignTexture, createDoorPlaqueTexture } from '../../utils/proceduralPosters';
import { soundManager } from '../../utils/soundEffects';
import { 
  ChevronLeft, 
  ChevronRight, 
  DoorOpen, 
  Sparkles, 
  Film, 
  ArrowRight, 
  X, 
  LayoutGrid,
  MapPin,
  Clock,
  Star,
  Volume2,
  Calendar,
  CheckCircle2,
  Keyboard,
  Info,
  Flame,
  Ticket
} from 'lucide-react';

const ROOM_SPACING = 10.0;
const TOTAL_HALLS = HALL_SCHEDULES.length;

// Floating cinematic dust motes (ambient particle field)
const CinemaAtmosphereMotes: React.FC = () => {
  const count = 150;
  const hallwayLength = TOTAL_HALLS * ROOM_SPACING + 14;
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5.2;
      pos[i * 3 + 1] = Math.random() * 3.6 + 0.4;
      pos[i * 3 + 2] = -Math.random() * hallwayLength + 5;
    }
    return pos;
  });

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Subtle float
      pos[i * 3 + 1] += Math.sin(Date.now() * 0.0015 + i) * 0.0015;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FDE68A"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Double Doors component with realistic opening swing & brass hardware
interface DoorsProps {
  isOpen: boolean;
  hall: HallSchedule;
  onClick: () => void;
}

const DoubleDoors: React.FC<DoorsProps> = ({ isOpen, hall, onClick }) => {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  const signTex = useMemo(() => createHallSignTexture(hall), [hall]);
  const doorPlaqueTex = useMemo(() => createDoorPlaqueTexture(hall), [hall]);

  useFrame((_, delta) => {
    const targetAngle = isOpen ? Math.PI * 0.48 : 0;
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = THREE.MathUtils.damp(
        leftDoorRef.current.rotation.y,
        -targetAngle,
        6,
        delta
      );
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = THREE.MathUtils.damp(
        rightDoorRef.current.rotation.y,
        targetAngle,
        6,
        delta
      );
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer Door Frame / Architrave */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[2.5, 3.4, 0.15]} />
        <meshStandardMaterial color="#0A0E0C" roughness={0.7} />
      </mesh>

      {/* Door Opening Reveal (Dark interior void) */}
      <mesh position={[0, 1.7, -0.05]}>
        <planeGeometry args={[2.3, 3.2]} />
        <meshBasicMaterial color="#030406" />
      </mesh>

      {/* Left Door leaf with hinge at left edge */}
      <group ref={leftDoorRef} position={[-1.1, 1.7, 0]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 3.2, 0.08]} />
          <meshStandardMaterial color="#5B3748" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Brass kickplate */}
        <mesh position={[0.55, -1.3, 0.045]}>
          <boxGeometry args={[1.0, 0.35, 0.02]} />
          <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Vertical glass peephole window */}
        <mesh position={[0.55, 0.95, 0.045]}>
          <boxGeometry args={[0.22, 0.5, 0.02]} />
          <meshStandardMaterial color="#111" roughness={0.1} />
        </mesh>

        {/* EMBOSSED LUXURY DOOR PLAQUE ON LEFT DOOR:
            Logo + Hall Name + Small Distance (Requested by User) */}
        <mesh position={[0.55, 0.22, 0.045]}>
          <planeGeometry args={[0.78, 1.05]} />
          <meshStandardMaterial
            map={doorPlaqueTex}
            roughness={0.25}
            metalness={0.35}
            emissive="#FFFFFF"
            emissiveMap={doorPlaqueTex}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0.55, 0.22, 0.042]}>
          <boxGeometry args={[0.82, 1.09, 0.01]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Brass Door Handle */}
        <mesh position={[1.0, -0.1, 0.06]}>
          <boxGeometry args={[0.04, 0.28, 0.04]} />
          <meshStandardMaterial color="#E2C17D" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Right Door leaf with hinge at right edge */}
      <group ref={rightDoorRef} position={[1.1, 1.7, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 3.2, 0.08]} />
          <meshStandardMaterial color="#5B3748" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Brass kickplate */}
        <mesh position={[-0.55, -1.3, 0.045]}>
          <boxGeometry args={[1.0, 0.35, 0.02]} />
          <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Vertical glass peephole window */}
        <mesh position={[-0.55, 0.95, 0.045]}>
          <boxGeometry args={[0.22, 0.5, 0.02]} />
          <meshStandardMaterial color="#111" roughness={0.1} />
        </mesh>

        {/* EMBOSSED LUXURY DOOR PLAQUE ON RIGHT DOOR:
            Logo + Hall Name + Small Distance (Requested by User) */}
        <mesh position={[-0.55, 0.22, 0.045]}>
          <planeGeometry args={[0.78, 1.05]} />
          <meshStandardMaterial
            map={doorPlaqueTex}
            roughness={0.25}
            metalness={0.35}
            emissive="#FFFFFF"
            emissiveMap={doorPlaqueTex}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[-0.55, 0.22, 0.042]}>
          <boxGeometry args={[0.82, 1.09, 0.01]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Brass Door Handle */}
        <mesh position={[-1.0, -0.1, 0.06]}>
          <boxGeometry args={[0.04, 0.28, 0.04]} />
          <meshStandardMaterial color="#E2C17D" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ILLUMINATED ARCHITRAVE SIGNBOARD ABOVE DOOR:
          Hall Name + Directly Under That Distance from You (Requested by User) */}
      <group position={[0, 3.82, 0.12]}>
        {/* Outer Shadow Box Frame */}
        <mesh>
          <boxGeometry args={[2.55, 0.88, 0.12]} />
          <meshStandardMaterial color="#0A0E0C" roughness={0.7} />
        </mesh>
        {/* Brass Bezel Outline */}
        <mesh position={[0, 0, 0.062]}>
          <boxGeometry args={[2.59, 0.92, 0.02]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Illuminated Marquee Face with Crisp Name & Distance */}
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[2.48, 0.82]} />
          <meshStandardMaterial
            map={signTex}
            roughness={0.25}
            emissive="#FFFFFF"
            emissiveMap={signTex}
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* Overhead Brass Light Spotlight illuminating the sign & doorway */}
        <pointLight position={[0, 0.2, 0.45]} intensity={2.6} distance={5.0} color="#FFF8EE" />
      </group>
    </group>
  );
};

// Luxury VIP Velvet Stanchions flanking the door entrance
const VelvetStanchions: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Left Post */}
      <mesh position={[-1.4, 0.45, 0.35]}>
        <cylinderGeometry args={[0.035, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-1.4, 0.025, 0.35]}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-1.4, 0.92, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Right Post */}
      <mesh position={[1.4, 0.45, 0.35]}>
        <cylinderGeometry args={[0.035, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 0.025, 0.35]}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 0.92, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Hallway Bay with Double Doors + Two Movie Posters (One on Left, One on Right)
interface HallBayProps {
  index: number;
  hall: HallSchedule;
  isOpen: boolean;
  onDoorClick: () => void;
  onPosterClick: (movie: Movie) => void;
}

const HallBay: React.FC<HallBayProps> = ({ index, hall, isOpen, onDoorClick, onPosterClick }) => {
  const zPos = -index * ROOM_SPACING;
  const isEven = index % 2 === 0;

  // Doors alternate left and right sides of corridor
  const doorX = isEven ? -2.85 : 2.85;
  const doorRotY = isEven ? Math.PI / 2 : -Math.PI / 2;

  const movie1 = hall.movies[0]?.movie;
  const movie2 = hall.movies[1]?.movie || hall.movies[0]?.movie;

  const posterTex1 = useMemo(() => createPosterTexture(movie1), [movie1]);
  const posterTex2 = useMemo(() => createPosterTexture(movie2), [movie2]);

  return (
    <group position={[0, 0, zPos]}>
      {/* Central Bay Group rotated along the corridor wall */}
      <group position={[doorX, 0, 0]} rotation={[0, doorRotY, 0]}>
        {/* The Double Doors with Hall Name, Distance, and Door Logo Plaque */}
        <DoubleDoors
          isOpen={isOpen}
          hall={hall}
          onClick={onDoorClick}
        />

        {/* Velvet Stanchions */}
        <VelvetStanchions />

        {/* POSTER 1: MOVIE 1 (Mounted on Left Side of Door, -2.1m) */}
        <group 
          position={[-2.1, 2.0, 0.02]}
          onClick={(e) => { e.stopPropagation(); onPosterClick(movie1); }}
        >
          {/* Overhead Brass Light Fixture */}
          <mesh position={[0, 1.35, 0.18]}>
            <boxGeometry args={[1.3, 0.08, 0.22]} />
            <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.3} />
          </mesh>
          <pointLight position={[0, 1.3, 0.35]} intensity={1.8} distance={3.8} color="#FFF8EE" />

          {/* Poster Plane */}
          <mesh>
            <planeGeometry args={[1.35, 2.1]} />
            <meshStandardMaterial
              map={posterTex1}
              roughness={0.25}
              emissive="#FFFFFF"
              emissiveMap={posterTex1}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Poster Outer Frame */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.45, 2.2, 0.03]} />
            <meshStandardMaterial color="#0C0E10" roughness={0.7} />
          </mesh>

          {/* Brass Plaque Tag: NOW SCREENING */}
          <mesh position={[0, -1.2, 0.04]}>
            <boxGeometry args={[1.1, 0.18, 0.02]} />
            <meshStandardMaterial color="#C5A059" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* POSTER 2: MOVIE 2 (Mounted on Right Side of Door, +2.1m) */}
        <group 
          position={[2.1, 2.0, 0.02]}
          onClick={(e) => { e.stopPropagation(); onPosterClick(movie2); }}
        >
          {/* Overhead Brass Light Fixture */}
          <mesh position={[0, 1.35, 0.18]}>
            <boxGeometry args={[1.3, 0.08, 0.22]} />
            <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.3} />
          </mesh>
          <pointLight position={[0, 1.3, 0.35]} intensity={1.8} distance={3.8} color="#FFF8EE" />

          {/* Poster Plane */}
          <mesh>
            <planeGeometry args={[1.35, 2.1]} />
            <meshStandardMaterial
              map={posterTex2}
              roughness={0.25}
              emissive="#FFFFFF"
              emissiveMap={posterTex2}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Poster Outer Frame */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.45, 2.2, 0.03]} />
            <meshStandardMaterial color="#0C0E10" roughness={0.7} />
          </mesh>

          {/* Brass Plaque Tag: NEXT FEATURE */}
          <mesh position={[0, -1.2, 0.04]}>
            <boxGeometry args={[1.1, 0.18, 0.02]} />
            <meshStandardMaterial color="#C5A059" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Corridor Overhead Downlight & Fixture */}
      <mesh position={[0, 4.3, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#C5A059" metalness={0.7} roughness={0.3} />
      </mesh>
      <spotLight
        position={[0, 4.2, 0]}
        target-position={[0, 0, 0]}
        angle={0.65}
        penumbra={0.8}
        intensity={3.0}
        distance={10}
        color="#FFF3E0"
      />
    </group>
  );
};

// Corridor Tunnel Architecture (Walls, Ceiling, Floor Runner, End Wall)
const CorridorTunnel: React.FC = () => {
  const hallwayLength = TOTAL_HALLS * ROOM_SPACING + 14;

  return (
    <group>
      {/* Carpet Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -hallwayLength / 2 + 5]}>
        <planeGeometry args={[6.0, hallwayLength]} />
        <meshStandardMaterial color="#1E0D16" roughness={0.9} />
      </mesh>

      {/* Floor Center Brass / Warm Inlay Strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -hallwayLength / 2 + 5]}>
        <planeGeometry args={[0.15, hallwayLength]} />
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Left Wall (Dark Forest Charcoal) */}
      <mesh position={[-3.0, 2.2, -hallwayLength / 2 + 5]}>
        <boxGeometry args={[0.2, 4.4, hallwayLength]} />
        <meshStandardMaterial color="#111916" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[3.0, 2.2, -hallwayLength / 2 + 5]}>
        <boxGeometry args={[0.2, 4.4, hallwayLength]} />
        <meshStandardMaterial color="#111916" roughness={0.8} />
      </mesh>

      {/* Horizontal Light Strip (Left & Right Walls) */}
      <mesh position={[-2.88, 2.2, -hallwayLength / 2 + 5]}>
        <boxGeometry args={[0.02, 0.04, hallwayLength]} />
        <meshBasicMaterial color="#E8D5B5" />
      </mesh>
      <mesh position={[2.88, 2.2, -hallwayLength / 2 + 5]}>
        <boxGeometry args={[0.02, 0.04, hallwayLength]} />
        <meshBasicMaterial color="#E8D5B5" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.4, -hallwayLength / 2 + 5]}>
        <planeGeometry args={[6.0, hallwayLength]} />
        <meshStandardMaterial color="#0A0E0C" roughness={0.9} />
      </mesh>

      {/* Distant End Elevator / Hallway Door */}
      <mesh position={[0, 2.2, -hallwayLength + 4]}>
        <planeGeometry args={[6.0, 4.4]} />
        <meshStandardMaterial color="#0C100E" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Smooth Camera Controller that glides down hallway and frames the active hall entrance
const CameraController: React.FC<{ activeIndex: number; isDoorOpen: boolean }> = ({
  activeIndex,
  isDoorOpen,
}) => {
  useFrame((state, delta) => {
    // Camera glides down Z according to the hall index
    const targetZ = -activeIndex * ROOM_SPACING + (isDoorOpen ? 0.6 : 2.2);
    const targetY = isDoorOpen ? 1.85 : 1.95;
    const isEven = activeIndex % 2 === 0;
    // Step slightly to opposite side of corridor to get a clear 3/4 perspective of the door & signage
    const targetX = isDoorOpen ? (isEven ? -0.9 : 0.9) : (isEven ? 0.75 : -0.75);

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 5, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 5, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 5, delta);

    // Look towards the door, the illuminated hall name sign, and posters
    const lookTargetX = isEven ? -2.7 : 2.7;
    const lookTargetY = 2.05;
    const lookTargetZ = -activeIndex * ROOM_SPACING;
    const lookAtVector = new THREE.Vector3(lookTargetX, lookTargetY, lookTargetZ);
    state.camera.lookAt(lookAtVector);
  });

  return null;
};

// Main 3D Hallway Experience
export const CinemaHallway3D: React.FC = () => {
  const {
    hallwayRoomIndex,
    setHallwayRoomIndex,
    nextHallwayRoom,
    prevHallwayRoom,
    isDoorOpen,
    setDoorOpen,
    selectHallShowtime,
    setViewMode,
    isMuted,
  } = useBookingStore();

  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');

  const currentHall = HALL_SCHEDULES[hallwayRoomIndex] || HALL_SCHEDULES[0];

  const handleDoorToggle = () => {
    if (isDoorOpen) {
      soundManager.playDoorClose(isMuted);
      setDoorOpen(false);
    } else {
      soundManager.playDoorOpen(isMuted);
      setDoorOpen(true);
    }
  };

  const handleSelectTiming = (movie: Movie, showtime: Showtime) => {
    soundManager.playShowtimeSelect(isMuted);
    selectHallShowtime(currentHall, movie, showtime);
  };

  // Keyboard navigation for full spatial walkthrough
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        soundManager.playFootstep(isMuted);
        prevHallwayRoom();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        soundManager.playFootstep(isMuted);
        nextHallwayRoom();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isDoorOpen) {
          soundManager.playDoorClose(isMuted);
          setDoorOpen(false);
        } else {
          soundManager.playDoorOpen(isMuted);
          setDoorOpen(true);
        }
      } else if (e.key === 'Escape') {
        if (isDoorOpen) {
          soundManager.playDoorClose(isMuted);
          setDoorOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevHallwayRoom, nextHallwayRoom, isDoorOpen, setDoorOpen, isMuted]);

  return (
    <div className="relative h-[calc(100vh-65px)] w-full overflow-hidden bg-obsidian select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.9, 3.5], fov: 60, near: 0.1, far: 80 }}
        className="h-full w-full"
      >
        <ambientLight intensity={1.3} color="#FFFFFF" />
        <directionalLight position={[0, 8, 5]} intensity={1.8} color="#FFF8EE" />
        <CorridorTunnel />
        
        {/* Floating atmospheric particles / dust motes in light cones */}
        <CinemaAtmosphereMotes />

        {HALL_SCHEDULES.map((hall, idx) => (
          <HallBay
            key={hall.id}
            index={idx}
            hall={hall}
            isOpen={idx === hallwayRoomIndex && isDoorOpen}
            onDoorClick={() => {
              if (hallwayRoomIndex === idx) {
                handleDoorToggle();
              } else {
                soundManager.playFootstep(isMuted);
                soundManager.playDoorOpen(isMuted);
                setHallwayRoomIndex(idx);
                setDoorOpen(true);
              }
            }}
            onPosterClick={(movie) => {
              soundManager.playFootstep(isMuted);
              soundManager.playDoorOpen(isMuted);
              setHallwayRoomIndex(idx);
              setDoorOpen(true);
            }}
          />
        ))}

        <CameraController activeIndex={hallwayRoomIndex} isDoorOpen={isDoorOpen} />
      </Canvas>

      {/* TOP OVERLAY HUD: AFTER HOURS BRAND, DISTANCE SORTED INDICATOR & QUICK EXIT */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center space-x-3 rounded-full border border-white/15 bg-charcoal/85 px-4 py-2 backdrop-blur-md shadow-xl">
          <span className="font-display text-sm font-black tracking-widest text-cream">
            AFTER HOURS <span className="text-purple-400 font-normal">CINEMA CORRIDOR</span>
          </span>
          <span className="h-3 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-1.5 font-mono text-xs">
            <span className="font-bold text-amber-300">
              HALL {currentHall.hallNumber}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-emeraldLight font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emeraldLight" />
              {currentHall.distanceLabel}
            </span>
          </div>
        </div>

        {/* Keyboard shortcut guide badge */}
        <div className="pointer-events-auto hidden lg:flex items-center space-x-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 text-[11px] font-mono text-creamMuted backdrop-blur-md">
          <Keyboard className="h-3.5 w-3.5 text-purple-400" />
          <span>[← / → Walk] &nbsp; [Space Open Door] &nbsp; [Esc Close]</span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className="flex items-center space-x-1.5 rounded-full border border-white/20 bg-charcoal/80 px-4 py-2 text-xs font-semibold text-cream hover:bg-white/10 hover:border-white/40 transition shadow-lg"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Switch to Grid View</span>
          </button>
        </div>
      </div>

      {/* HALL NAVIGATION CONTROLS (LEFT / RIGHT ARROWS) */}
      <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-10 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playFootstep(isMuted);
            prevHallwayRoom();
          }}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-charcoal/80 text-cream shadow-xl backdrop-blur-md hover:bg-white/20 hover:scale-110 transition"
          title="Previous Hall (Left Arrow)"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={() => {
            soundManager.playFootstep(isMuted);
            nextHallwayRoom();
          }}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-charcoal/80 text-cream shadow-xl backdrop-blur-md hover:bg-white/20 hover:scale-110 transition"
          title="Next Hall (Right Arrow)"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* BOTTOM HALL INDICATORS & PROXIMITY SORTED STRIP */}
      <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-3">
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/20 bg-charcoal/90 px-5 py-2.5 backdrop-blur-xl shadow-2xl">
          {/* Door Toggle Button */}
          <button
            onClick={handleDoorToggle}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-md ${
              isDoorOpen
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-cream hover:bg-white/20 border border-white/10'
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            <span>{isDoorOpen ? 'Close Hall Doors' : 'Enter Hall & See Showtimes'}</span>
          </button>

          <span className="hidden sm:block h-5 w-[1px] bg-white/20" />

          {/* Hall Selector Buttons Ordered by Distance */}
          <div className="flex items-center space-x-2">
            {HALL_SCHEDULES.map((h, idx) => {
              const isSelected = idx === hallwayRoomIndex;
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    soundManager.playFootstep(isMuted);
                    soundManager.playDoorOpen(isMuted);
                    setHallwayRoomIndex(idx);
                    setDoorOpen(true);
                  }}
                  className={`group relative flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-cream text-obsidian scale-105 shadow-glow-screen'
                      : 'bg-white/5 text-creamMuted hover:bg-white/15 hover:text-cream border border-white/10'
                  }`}
                >
                  <span className="font-mono">Hall {h.hallNumber}</span>
                  <span className={`text-[10px] font-normal opacity-70 ${isSelected ? 'text-obsidian' : 'text-creamMuted'}`}>
                    ({h.distanceKm} km)
                  </span>
                  {idx === 0 && (
                    <span className="absolute -top-2 -right-1 rounded-full bg-emeraldAccent px-1.5 py-0.2 text-[8px] font-black uppercase text-obsidian shadow-sm">
                      Near
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE HALL SHOWTIME MARQUEE (ALL MOVIES & TIMINGS IN THIS HALL) */}
      {isDoorOpen && (
        <div className="absolute top-16 right-4 sm:right-6 bottom-20 z-30 w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-[#F4F1EA] text-[#141416] p-6 shadow-2xl animate-in slide-in-from-right-8 duration-300">
          {/* Header of Hall Schedule */}
          <div className="relative border-b border-stone-300 pb-4">
            <button
              onClick={() => {
                soundManager.playDoorClose(isMuted);
                setDoorOpen(false);
              }}
              className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20 transition"
              title="Close Schedule"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-black px-2.5 py-1 font-mono text-xs font-black text-white">
                HALL {currentHall.hallNumber}
              </span>
              <span className="rounded-full bg-emerald-700/10 border border-emerald-700/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {currentHall.distanceLabel}
              </span>
            </div>

            <h3 className="font-display text-2xl font-black text-stone-900 mt-2">
              {currentHall.name}
            </h3>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {currentHall.cinemaName} • {currentHall.location}
            </p>
            <p className="text-[11px] text-purple-900 font-semibold mt-1 flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" />
              <span>{currentHall.soundSystem} • 4K Laser Projection</span>
            </p>

            {/* Timing Category Filter Pills */}
            <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              {[
                { id: 'all', label: 'All Shows' },
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' },
                { id: 'evening', label: 'Prime 5-9PM' },
                { id: 'night', label: 'Late Night' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.id as typeof timeFilter)}
                  className={`rounded-full px-2.5 py-1 transition ${
                    timeFilter === tab.id
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of All Movies & All Their Showtimes in this Hall */}
          <div className="mt-5 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xs font-black uppercase tracking-wider text-stone-500">
                Scheduled Movies in Hall {currentHall.hallNumber}:
              </h4>
              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                Select timing to book seats
              </span>
            </div>

            {currentHall.movies.map(({ movie, schedule }, movieIndex) => {
              // Apply time filter
              const filteredSchedule = schedule.filter((st) => {
                const hour = parseInt(st.time.split(':')[0], 10);
                if (timeFilter === 'morning') return hour < 12;
                if (timeFilter === 'afternoon') return hour >= 12 && hour < 17;
                if (timeFilter === 'evening') return hour >= 17 && hour < 21;
                if (timeFilter === 'night') return hour >= 21;
                return true;
              });

              if (filteredSchedule.length === 0) return null;

              return (
                <div
                  key={movie.id}
                  className="rounded-2xl border border-stone-300/80 bg-white p-4 shadow-sm space-y-3 hover:border-stone-400 transition"
                >
                  {/* Movie Header Row */}
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className="flex h-12 w-10 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black text-white shadow-sm"
                        style={{ backgroundColor: movie.accentColor }}
                      >
                        {movie.roomNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            {movieIndex === 0 ? 'Now Screening Feature' : 'Next Feature'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center text-xs font-bold text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                            {movie.rating}
                          </span>
                        </div>

                        <h5 className="font-display text-lg font-black text-stone-900 leading-tight">
                          {movie.title}
                        </h5>
                        <p className="text-[11px] text-stone-500">
                          {movie.duration} • {movie.genre.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* All Showtimes & Timings for this Movie */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Available Timings & Screen Formats:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {filteredSchedule.map((showtime) => {
                        let statusBadge = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                        let seatCountText = '84 seats available';
                        if (showtime.availability === 'filling-fast') {
                          statusBadge = 'text-amber-800 bg-amber-50 border-amber-200';
                          seatCountText = '24 seats remaining';
                        } else if (showtime.availability === 'almost-full') {
                          statusBadge = 'text-rose-800 bg-rose-50 border-rose-200';
                          seatCountText = '7 seats left!';
                        }

                        return (
                          <button
                            key={showtime.id}
                            onClick={() => handleSelectTiming(movie, showtime)}
                            className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-left transition-all hover:bg-stone-900 hover:text-white hover:border-black hover:shadow-md hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-stone-900 group-hover:text-white">
                                {showtime.time}
                              </span>
                              <span className={`rounded px-1.5 py-0.2 text-[8px] font-bold border ${statusBadge} group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent`}>
                                {showtime.availability === 'available' ? 'Available' : showtime.availability === 'filling-fast' ? 'Filling Fast' : 'Almost Full'}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px]">
                              <span className="text-stone-600 group-hover:text-stone-300 font-medium">
                                {showtime.format}
                              </span>
                              <span className="font-mono font-bold text-emerald-800 group-hover:text-emerald-300">
                                From ₹{Math.round(350 * showtime.priceMultiplier)}
                              </span>
                            </div>

                            <span className="mt-1 text-[8px] text-stone-400 group-hover:text-stone-400 font-mono">
                              {seatCountText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-stone-300 pt-3 text-center">
            <p className="text-[11px] text-stone-500">
              💡 Selecting any timing automatically opens the **Interactive Seat Map** with the **3D First-Person Sightline Simulator**.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
