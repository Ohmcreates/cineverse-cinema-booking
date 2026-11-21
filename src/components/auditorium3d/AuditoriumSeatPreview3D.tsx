import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBookingStore, MAX_BOOKING_SEATS } from '../../store/useBookingStore';
import { Seat } from '../../types';
import { calculateSeatOpticalMetrics } from '../../utils/seatGenerator';
import { soundManager } from '../../utils/soundEffects';
import { 
  ArrowLeft, 
  Compass, 
  Eye, 
  Sparkles, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Move,
  Radar
} from 'lucide-react';

// Realistic dark attendee silhouette seated in booked seat for sightline depth & obstruction check
const AttendeeSilhouette3D: React.FC<{ seat: Seat }> = ({ seat }) => {
  return (
    <group position={[seat.x, seat.y, seat.z]}>
      {/* Torso */}
      <mesh position={[0, 0.68, 0.08]}>
        <boxGeometry args={[0.38, 0.42, 0.22]} />
        <meshStandardMaterial color="#0D1016" roughness={0.9} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.90, 0.08]}>
        <boxGeometry args={[0.44, 0.12, 0.24]} />
        <meshStandardMaterial color="#090B10" roughness={0.9} />
      </mesh>
      {/* Head & Hair */}
      <mesh position={[0, 1.18, 0.08]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#11151E" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Single 3D Cinema Seat with cushion, backrest, armrests, and realistic material
interface SeatMeshProps {
  seat: Seat;
  isSelected: boolean;
  isOccupied: boolean;
  onClick: () => void;
}

const CinemaSeat3D: React.FC<SeatMeshProps> = ({ seat, isSelected, isOccupied, onClick }) => {
  const isRecliner = seat.tier === 'recliner';

  let seatColor = '#2A2E35';
  if (isSelected) {
    seatColor = '#10B981'; // Mint Green
  } else if (isOccupied) {
    seatColor = '#171A21';
  } else if (isRecliner) {
    seatColor = '#7A2E3D'; // Burgundy velvet
  }

  return (
    <group
      position={[seat.x, seat.y, seat.z]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOccupied) onClick();
      }}
    >
      {/* Seat Cushion */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.55, 0.14, 0.52]} />
        <meshStandardMaterial
          color={seatColor}
          roughness={0.7}
          emissive={isSelected ? '#10B981' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* Seat Backrest (angled back slightly) */}
      <mesh position={[0, 0.72, 0.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.54, 0.65, 0.12]} />
        <meshStandardMaterial
          color={seatColor}
          roughness={0.7}
          emissive={isSelected ? '#10B981' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* Headrest / VIP Cushion */}
      <mesh position={[0, 1.08, 0.2]}>
        <boxGeometry args={[0.42, 0.18, 0.14]} />
        <meshStandardMaterial color={seatColor} roughness={0.6} />
      </mesh>

      {/* Armrests (Left & Right) */}
      <mesh position={[-0.31, 0.48, 0.05]}>
        <boxGeometry args={[0.07, 0.32, 0.46]} />
        <meshStandardMaterial color="#14171C" roughness={0.5} />
      </mesh>
      <mesh position={[0.31, 0.48, 0.05]}>
        <boxGeometry args={[0.07, 0.32, 0.46]} />
        <meshStandardMaterial color="#14171C" roughness={0.5} />
      </mesh>

      {/* Base Pedestal / Leg */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.32, 8]} />
        <meshStandardMaterial color="#0C0D11" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Selected Indicator Beacon (floating green dot above selected seat) */}
      {isSelected && (
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#6EE7B7" />
        </mesh>
      )}
    </group>
  );
};

// Massive Curved IMAX Cinema Screen with animated dynamic canvas texture & ambient glow
const CurvedIMAXScreen: React.FC<{ movieTitle: string; accentColor: string }> = ({
  movieTitle,
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const screenGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(15, 6.8, 32, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      // Curve edges forward toward audience slightly (like real IMAX)
      const curve = (1 - Math.pow(x / 7.5, 2)) * 0.8;
      pos.setZ(i, curve);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const canvasTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    textureRef.current = tex;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const t = clock.getElapsedTime();
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const cx = w / 2;
    const cy = h / 2;

    // Rich cinematic sci-fi horizon animation
    const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 550);
    grad.addColorStop(0, '#FFE8D6');
    grad.addColorStop(0.3, accentColor || '#D97706');
    grad.addColorStop(0.7, '#1E1B4B');
    grad.addColorStop(1, '#05050A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dynamic undulating cosmic grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    for (let y = cy + 10; y < h; y += 22) {
      const wave = Math.sin(t * 2 + y * 0.05) * 6;
      ctx.beginPath();
      ctx.moveTo(0, y + wave);
      ctx.lineTo(w, y + wave);
      ctx.stroke();
    }

    // Converging vanishing lines to center
    for (let x = -100; x <= w + 100; x += 70) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(x + Math.sin(t + x) * 10, h);
      ctx.stroke();
    }

    // Glowing sun / portal orb
    const pulse = 95 + Math.sin(t * 3) * 12;
    ctx.beginPath();
    ctx.arc(cx, cy - 25, pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF5';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Screen On-Screen Overlay Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(movieTitle.toUpperCase(), cx, cy - 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('• 70MM IMAX PROJECTION • DOLBY ATMOS •', cx, cy - 70);

    textureRef.current.needsUpdate = true;
  });

  return (
    <group position={[0, 3.2, 0]}>
      {/* Curved Screen Mesh */}
      <mesh geometry={screenGeometry}>
        <meshBasicMaterial
          map={canvasTexture}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Screen Frame Border */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[15.2, 7.0, 0.08]} />
        <meshStandardMaterial color="#0A0B0E" roughness={0.9} />
      </mesh>

      {/* Dynamic Screen Ambient Light */}
      <pointLight position={[0, 0, 2.0]} intensity={3.5} distance={20} color="#FFE6CC" />
    </group>
  );
};

// Auditorium Architecture (Riser stepped floors, acoustic walls, glowing aisle lights)
const AuditoriumEnvironment: React.FC = () => {
  return (
    <group>
      {/* Stadium Tiered Risers (Stepped Floor) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const stepZ = 3.8 + i * 1.45;
        const stepY = i * 0.35;
        return (
          <mesh key={i} position={[0, stepY - 0.15, stepZ]}>
            <boxGeometry args={[16.0, 0.35, 1.5]} />
            <meshStandardMaterial color="#0D0F14" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Left Wall with Acoustic Baffle Panels */}
      <mesh position={[-7.5, 3.5, 10]}>
        <boxGeometry args={[0.3, 7.5, 22]} />
        <meshStandardMaterial color="#11141A" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[7.5, 3.5, 10]}>
        <boxGeometry args={[0.3, 7.5, 22]} />
        <meshStandardMaterial color="#11141A" roughness={0.8} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 3.5, 20]}>
        <boxGeometry args={[15.3, 7.5, 0.3]} />
        <meshStandardMaterial color="#0A0B0E" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 7.2, 10]}>
        <boxGeometry args={[15.3, 0.2, 22]} />
        <meshStandardMaterial color="#08090C" roughness={0.9} />
      </mesh>

      {/* Glowing Neon Floor Aisle Guidance Strips */}
      <mesh position={[-2.4, 0.05, 10]}>
        <boxGeometry args={[0.08, 0.02, 18]} />
        <meshBasicMaterial color="#06B6D4" />
      </mesh>
      <mesh position={[2.4, 0.05, 10]}>
        <boxGeometry args={[0.08, 0.02, 18]} />
        <meshBasicMaterial color="#06B6D4" />
      </mesh>
    </group>
  );
};

// Camera Controller: Flies into exact seat eye-level coordinates + supports mouse drag look-around
interface CameraSeatControllerProps {
  seat: Seat;
  lookAngles: { yaw: number; pitch: number };
}

const CameraSeatController: React.FC<CameraSeatControllerProps> = ({ seat, lookAngles }) => {
  useFrame((state, delta) => {
    // Exact eye level sitting down in this seat
    const eyeX = seat.x;
    const eyeY = seat.y + 1.15;
    const eyeZ = seat.z;

    // Smoothly interpolate camera position to seat coordinates
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, eyeX, 5, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, eyeY, 5, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, eyeZ, 5, delta);

    // Screen focal point at z = 0, y = 2.7
    // Add user's manual look-around angles (clamped yaw & pitch)
    const baseTarget = new THREE.Vector3(0, 2.7, 0);
    
    // Compute lookAt with rotation offset
    const targetWithLook = new THREE.Vector3(
      baseTarget.x + Math.sin(lookAngles.yaw) * 4.0,
      baseTarget.y + Math.sin(lookAngles.pitch) * 3.0,
      baseTarget.z
    );

    state.camera.lookAt(targetWithLook);
  });

  return null;
};

// Main Component
export const AuditoriumSeatPreview3D: React.FC = () => {
  const {
    selectedMovie,
    selectedTheater,
    selectedShowtime,
    seats,
    selectedSeats,
    activeSeatFor3D,
    setActiveSeatFor3D,
    toggleSeat,
    setViewMode,
    getGrandTotal,
    isMuted,
  } = useBookingStore();

  // Active seat fallback
  const currentSeat = activeSeatFor3D || selectedSeats[0] || seats.find((s) => s.id === 'F-8')!;
  const isSelected = selectedSeats.some((s) => s.id === currentSeat.id);

  // Optical & Acoustic metrics
  const metrics = useMemo(() => calculateSeatOpticalMetrics(currentSeat), [currentSeat]);

  // Constrained Look-Around interaction (Mouse Drag / Touch)
  const [lookAngles, setLookAngles] = useState({ yaw: 0, pitch: 0 });
  const [showAttendees, setShowAttendees] = useState(true);
  const [cameraFov, setCameraFov] = useState(65);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setLookAngles((prev) => ({
      yaw: THREE.MathUtils.clamp(prev.yaw - dx * 0.004, -Math.PI * 0.28, Math.PI * 0.28),
      pitch: THREE.MathUtils.clamp(prev.pitch - dy * 0.004, -Math.PI * 0.2, Math.PI * 0.2),
    }));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleResetLook = () => {
    setLookAngles({ yaw: 0, pitch: 0 });
  };

  // Seat Stepper helpers (Prev / Next Seat in same row)
  const handlePrevSeatInRow = () => {
    if (currentSeat.col > 1) {
      const prevKey = `${currentSeat.row}-${currentSeat.col - 1}`;
      const target = seats.find((s) => s.id === prevKey);
      if (target) {
        soundManager.playCameraSwoop(isMuted);
        setActiveSeatFor3D(target);
      }
    }
  };

  const handleNextSeatInRow = () => {
    if (currentSeat.col < 14) {
      const nextKey = `${currentSeat.row}-${currentSeat.col + 1}`;
      const target = seats.find((s) => s.id === nextKey);
      if (target) {
        soundManager.playCameraSwoop(isMuted);
        setActiveSeatFor3D(target);
      }
    }
  };

  const handleSelectSeatIn3D = (seat: Seat) => {
    soundManager.playCameraSwoop(isMuted);
    setActiveSeatFor3D(seat);
  };

  if (!selectedMovie || !selectedTheater || !selectedShowtime) return null;

  return (
    <div
      className="relative h-[calc(100vh-65px)] w-full overflow-hidden bg-obsidian select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [currentSeat.x, currentSeat.y + 2.5, currentSeat.z + 4], fov: cameraFov, near: 0.1, far: 50 }}
        className="h-full w-full"
      >
        <ambientLight intensity={1.4} color="#FFFFFF" />
        <directionalLight position={[0, 10, 10]} intensity={1.8} color="#FFFFFF" />
        <AuditoriumEnvironment />
        
        {/* Curved IMAX Screen */}
        <CurvedIMAXScreen
          movieTitle={selectedMovie.title}
          accentColor={selectedMovie.accentColor}
        />

        {/* 3D Cinema Seats */}
        {seats.map((seat) => (
          <CinemaSeat3D
            key={seat.id}
            seat={seat}
            isSelected={seat.id === currentSeat.id || selectedSeats.some((s) => s.id === seat.id)}
            isOccupied={seat.status === 'sold'}
            onClick={() => handleSelectSeatIn3D(seat)}
          />
        ))}

        {/* Realistic Attendee Silhouettes in Booked Seats (Sightline Clearance Check) */}
        {showAttendees &&
          seats
            .filter((s) => s.status === 'sold' && s.id !== currentSeat.id)
            .map((seat) => <AttendeeSilhouette3D key={`att-${seat.id}`} seat={seat} />)}

        {/* First-person Camera Controller */}
        <CameraSeatController seat={currentSeat} lookAngles={lookAngles} />
      </Canvas>

      {/* TOP HUD BAR: BRAND, VANTAGE INFO, RETURN TO 2D MAP */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center space-x-3 rounded-full border border-white/20 bg-charcoal/90 px-4 py-2 backdrop-blur-md shadow-2xl">
          <button
            onClick={() => setViewMode('seats')}
            className="flex items-center space-x-1.5 text-xs font-bold text-cream hover:text-emeraldLight transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to 2D Map</span>
          </button>
          <span className="h-3 w-[1px] bg-white/20" />
          <span className="font-mono text-xs font-bold text-emeraldLight">
            ROW {currentSeat.row} • SEAT {currentSeat.col}
          </span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-creamMuted uppercase">
            ₹{currentSeat.price}
          </span>
        </div>

        {/* Controls Pill: Attendees Toggle + FOV + Reset Look */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Recenter View Button */}
          {(Math.abs(lookAngles.yaw) > 0.05 || Math.abs(lookAngles.pitch) > 0.05) && (
            <button
              onClick={handleResetLook}
              className="flex items-center space-x-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/80 px-3 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900 transition shadow-lg backdrop-blur-md"
            >
              <span>Recenter Sightline ⟲</span>
            </button>
          )}

          {/* Attendees Toggle */}
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className={`flex items-center space-x-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition shadow-lg backdrop-blur-md ${
              showAttendees
                ? 'border-purple-400/40 bg-purple-950/80 text-purple-200 hover:bg-purple-900'
                : 'border-white/20 bg-charcoal/80 text-creamMuted hover:bg-white/10'
            }`}
          >
            <span>Audience Silhouettes: {showAttendees ? 'ON' : 'OFF'}</span>
          </button>

          {/* Look around instruction badge */}
          <div className="hidden lg:flex items-center space-x-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 text-[11px] font-medium text-creamMuted backdrop-blur-md">
            <Move className="h-3.5 w-3.5 text-emeraldLight animate-pulse" />
            <span>Drag to rotate head</span>
          </div>
        </div>
      </div>

      {/* MINI AUDITORIUM RADAR OVERLAY (TOP LEFT) */}
      <div className="pointer-events-none absolute top-16 left-4 z-20 hidden md:block">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/15 bg-charcoal/85 p-3 backdrop-blur-xl shadow-xl w-52 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-creamMuted uppercase">
            <span className="flex items-center gap-1">
              <Radar className="h-3 w-3 text-emeraldLight animate-spin" />
              <span>Interactive Hall Radar</span>
            </span>
            <span className="text-emeraldLight font-bold">{currentSeat.row}{currentSeat.col}</span>
          </div>

          <div className="relative h-28 w-full rounded-xl bg-black/60 border border-white/10 p-2 flex flex-col justify-between overflow-hidden">
            {/* Curved screen in radar */}
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-sm" />
            
            {/* Clickable seat rows representation */}
            <div className="grid grid-rows-5 gap-1.5 my-auto px-1">
              {['B', 'D', 'F', 'H', 'I'].map((r) => (
                <div key={r} className="flex justify-between items-center text-[7px] font-mono text-white/30">
                  <span>{r}</span>
                  <div className="flex space-x-1">
                    {[3, 6, 8, 10, 12].map((c) => {
                      const targetKey = `${r}-${c}`;
                      const isCurrent = currentSeat.id === targetKey;
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            const found = seats.find((s) => s.id === targetKey);
                            if (found) handleSelectSeatIn3D(found);
                          }}
                          className={`h-1.5 w-2 rounded-sm transition ${
                            isCurrent
                              ? 'bg-emeraldAccent shadow-[0_0_6px_#10B981]'
                              : 'bg-white/20 hover:bg-white/60'
                          }`}
                          title={`Hop to Seat ${r}${c}`}
                        />
                      );
                    })}
                  </div>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="text-center text-[7px] font-mono tracking-widest uppercase text-white/40">
              CLICK DOTS TO HOP SEATS
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING OPTICAL SIGHTLINE METRICS CARD (TOP RIGHT) */}
      <div className="pointer-events-none absolute top-16 right-4 z-20 w-80 max-w-[calc(100vw-32px)]">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/15 bg-charcoal/90 p-4 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-creamMuted">
              OPTICAL SIGHTLINE HUD
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${metrics.tierColor}20`,
                color: metrics.tierColor,
                border: `1px solid ${metrics.tierColor}50`,
              }}
            >
              {metrics.tierBadge}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl bg-white/5 p-2.5">
              <span className="block text-[10px] uppercase font-bold text-creamMuted/70">
                Distance to Screen
              </span>
              <span className="font-mono text-base font-black text-cream">
                {metrics.distanceMeters} m
              </span>
            </div>

            <div className="rounded-xl bg-white/5 p-2.5">
              <span className="block text-[10px] uppercase font-bold text-creamMuted/70">
                Field of View (FOV)
              </span>
              <span className="font-mono text-base font-black text-cream">
                {metrics.fovDegrees}°
              </span>
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-creamMuted/80 border-t border-white/5 pt-2">
            <div className="flex justify-between">
              <span>Lateral Offset:</span>
              <span className="font-bold text-cream">{metrics.lateralDescription}</span>
            </div>
            <div className="flex justify-between">
              <span>Vertical Sightline:</span>
              <span className="font-bold text-cream">{metrics.neckDescription}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Dolby Atmos Acoustic:</span>
              <span className="font-mono font-bold">{metrics.acousticScore}% Phased</span>
            </div>
          </div>

          <p className="text-[10px] italic text-amber-200/80 leading-snug">
            "{metrics.recommendedAudience}"
          </p>
        </div>
      </div>

      {/* BOTTOM SEAT CONTROLS & HUD (INSPIRED BY AFTER HOURS VIDEO 2) */}
      <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center px-4">
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/20 bg-charcoal/95 p-3 sm:px-5 sm:py-3 shadow-2xl backdrop-blur-2xl">
          {/* Seat Identity & Stepper */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevSeatInRow}
              disabled={currentSeat.col <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cream hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Seat in Row"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center min-w-[110px]">
              <span className="block text-[9px] uppercase font-bold tracking-wider text-creamMuted/70">
                CURRENT VANTAGE
              </span>
              <span className="font-mono text-base font-black text-cream">
                {currentSeat.row}{currentSeat.col}
              </span>
              <span className="text-[10px] text-creamMuted block">
                {currentSeat.tier.toUpperCase()} • ₹{currentSeat.price}
              </span>
            </div>

            <button
              onClick={handleNextSeatInRow}
              disabled={currentSeat.col >= 14}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cream hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Seat in Row"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="hidden sm:block h-8 w-[1px] bg-white/15" />

          {/* Select / Deselect Seat Button */}
          <button
            onClick={() => toggleSeat(currentSeat.id)}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
              isSelected
                ? 'bg-emeraldAccent text-obsidian shadow-glow-emerald hover:bg-emerald-400'
                : 'border border-white/20 bg-white/10 text-cream hover:bg-white/20'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-obsidian" />
                <span>Selected ({selectedSeats.length}/{MAX_BOOKING_SEATS}) ✓</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Book Seat (+₹{currentSeat.price}) [{selectedSeats.length}/{MAX_BOOKING_SEATS}]</span>
              </>
            )}
          </button>

          {/* Direct Proceed to Checkout CTA */}
          {selectedSeats.length > 0 && (
            <button
              onClick={() => setViewMode('checkout')}
              className="flex items-center space-x-2 rounded-xl bg-crimson px-5 py-2.5 text-xs font-bold text-white shadow-glow-crimson hover:bg-crimsonHover transition hover:scale-105"
            >
              <span>Confirm & Pay ₹{getGrandTotal()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
