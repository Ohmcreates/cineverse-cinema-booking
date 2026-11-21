import * as THREE from 'three';
import { Movie, HallSchedule } from '../types';

export function createPosterTexture(movie: Movie): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, movie.backdropColor);
  grad.addColorStop(0.5, '#0F172A');
  grad.addColorStop(1, '#05070A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  // Top header (Room number + Format)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`ROOM ${movie.roomNumber}`, 40, 60);

  ctx.fillStyle = movie.accentColor;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(movie.formats[0].toUpperCase(), canvas.width - 40, 60);
  ctx.textAlign = 'left';

  // Graphic Motif in center
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.42;

  // Outer ambient glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.fillStyle = movie.accentColor;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Stylized inner motif
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 20);
  ctx.lineTo(cx + 40, cy);
  ctx.lineTo(cx - 30, cy + 20);
  ctx.closePath();
  ctx.fill();

  // Japanese Title (if present)
  if (movie.japaneseTitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(movie.japaneseTitle, cx, cy + 160);
  }

  // Movie Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 46px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(movie.title.toUpperCase(), cx, cy + 210);

  // Tagline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'italic 18px "Inter", sans-serif';
  ctx.fillText(`"${movie.tagline.slice(0, 42)}..."`, cx, cy + 250);

  // Bottom credits
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '16px monospace';
  ctx.fillText(`DIR. ${movie.director.toUpperCase()} • ${movie.duration}`, cx, canvas.height - 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createScreenAnimatedTexture(movie: Movie, frameTime: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576; // 16:9 aspect
  const ctx = canvas.getContext('2d')!;

  const time = frameTime * 0.001;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Background space gradient
  const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 600);
  grad.addColorStop(0, movie.accentColor);
  grad.addColorStop(0.4, movie.backdropColor);
  grad.addColorStop(1, '#020205');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Animated wave / horizon grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  for (let y = cy + 20; y < canvas.height; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Horizon lines converging
  for (let x = -200; x <= canvas.width + 200; x += 80) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 20);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Pulsing Sun / Orb on horizon
  const sunRadius = 90 + Math.sin(time * 2) * 10;
  ctx.beginPath();
  ctx.arc(cx, cy - 30, sunRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF8EE';
  ctx.shadowColor = movie.accentColor;
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Title on screen
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 38px "Cabinet Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(movie.title, cx, cy - 140);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`• NOW SCREENING • HALL ${movie.roomNumber} • 4K LASER •`, cx, cy - 100);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Marquee Sign Texture: Hall Name + Distance from you
export function createHallSignTexture(hall: HallSchedule): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian slate background with brass border
  ctx.fillStyle = '#080C0A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer brass border
  ctx.strokeStyle = '#D4AF37'; // Luxury gold
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

  // Corner rivets/screws
  const rivet = (x: number, y: number) => {
    ctx.fillStyle = '#E6CA65';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5A4612';
    ctx.fillRect(x - 4, y - 1, 8, 2);
  };
  rivet(22, 22);
  rivet(canvas.width - 22, 22);
  rivet(22, canvas.height - 22);
  rivet(canvas.width - 22, canvas.height - 22);

  // Top header: Cinema brand & hall number
  ctx.fillStyle = '#F59E0B'; // Amber
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`• ${hall.cinemaName.toUpperCase()} • SCREEN ${hall.hallNumber} •`, canvas.width / 2, 70);

  // Main Hall Name (Prominent & Clear)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 48px "Cabinet Grotesk", sans-serif';
  ctx.fillText(hall.name.toUpperCase(), canvas.width / 2, 145);

  // Sound system tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(hall.soundSystem.toUpperCase(), canvas.width / 2, 195);

  // Distance Badge (Under the name, exactly as user requested!)
  // "iunder that place how much from you distance"
  const distY = 275;
  const badgeW = 560;
  const badgeH = 55;
  const badgeX = (canvas.width - badgeW) / 2;

  // Badge background (Glowing emerald / teal pill)
  ctx.fillStyle = '#064E3B';
  ctx.beginPath();
  ctx.roundRect(badgeX, distY - 38, badgeW, badgeH, 28);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Pin icon + Distance text
  ctx.fillStyle = '#A7F3D0';
  ctx.font = '900 30px "JetBrains Mono", monospace';
  ctx.fillText(`📍 ${hall.distanceKm} KM FROM YOU • NEAR`, canvas.width / 2, distY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Door Plaque Texture: Logo + Hall Name + Small Distance
export function createDoorPlaqueTexture(hall: HallSchedule): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // Deep burgundy velvet / polished obsidian door plaque background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1E0E18');
  grad.addColorStop(0.5, '#12080F');
  grad.addColorStop(1, '#080306');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer polished brass frame
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 12;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // Inner decorative border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

  const cx = canvas.width / 2;

  // --- LOGO / CREST EMBLEM (as user requested: "place the loco on the door") ---
  const logoY = 140;
  // Outer gold ring
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, logoY, 65, 0, Math.PI * 2);
  ctx.stroke();

  // Inner starburst / decorative ring
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, logoY, 52, 0, Math.PI * 2);
  ctx.stroke();

  // Cineverse Crown / Projector icon in center of logo
  ctx.fillStyle = '#F59E0B';
  // Stylized projector / film camera icon
  ctx.beginPath();
  ctx.roundRect(cx - 24, logoY - 14, 48, 30, 6);
  ctx.fill();
  // Film reel circles on top of camera
  ctx.beginPath();
  ctx.arc(cx - 14, logoY - 22, 12, 0, Math.PI * 2);
  ctx.arc(cx + 14, logoY - 22, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#D4AF37';
  ctx.fill();
  // Lens cone
  ctx.beginPath();
  ctx.moveTo(cx + 24, logoY - 6);
  ctx.lineTo(cx + 40, logoY - 16);
  ctx.lineTo(cx + 40, logoY + 16);
  ctx.lineTo(cx + 24, logoY + 6);
  ctx.closePath();
  ctx.fillStyle = '#FBBF24';
  ctx.fill();

  // Brand Name under Logo
  ctx.fillStyle = '#E5E7EB';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CINEVERSE PREMIERE', cx, logoY + 100);

  // Divider line
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 140, logoY + 125);
  ctx.lineTo(cx + 140, logoY + 125);
  ctx.stroke();

  // --- HALL NAME (as user requested: "an the name") ---
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 68px "Cabinet Grotesk", sans-serif';
  ctx.fillText(`HALL ${hall.hallNumber}`, cx, 390);

  // Detailed hall title
  ctx.fillStyle = '#FDE68A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(hall.name, cx, 440);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '18px monospace';
  ctx.fillText(hall.cinemaName, cx, 475);

  // --- SMALL DISTANCE (as user requested: "asnd samll ther deistance") ---
  const badgeY = 570;
  const bW = 340;
  const bH = 50;
  ctx.fillStyle = '#064E3B';
  ctx.beginPath();
  ctx.roundRect((canvas.width - bW) / 2, badgeY - 34, bW, bH, 25);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(`📍 ${hall.distanceKm} KM FROM YOU`, cx, badgeY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
