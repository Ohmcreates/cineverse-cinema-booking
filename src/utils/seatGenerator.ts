import { Seat, SeatTierType } from '../types';

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
export const COLS_PER_ROW = 14;

// Predefined occupied seats to feel authentic
const OCCUPIED_SEAT_KEYS = new Set([
  'A-2', 'A-3', 'A-6', 'A-7',
  'B-1', 'B-7', 'B-8', 'B-14',
  'C-5', 'C-6', 'C-9', 'C-10',
  'D-4', 'D-5', 'D-11', 'D-12',
  'E-3', 'E-4', 'E-8', 'E-9',
  'F-3', 'F-4', 'F-9', 'F-10',
  'G-6', 'G-7', 'G-8',
  'H-2', 'H-7', 'H-13',
  'I-1', 'I-5', 'I-6', 'I-14'
]);

export function generateAuditoriumSeats(): Seat[] {
  const seats: Seat[] = [];

  ROWS.forEach((row, rowIndex) => {
    let tier: SeatTierType = 'standard';
    let basePrice = 350;

    if (row === 'F' || row === 'G') {
      tier = 'sweetspot';
      basePrice = 500;
    } else if (row === 'H' || row === 'I') {
      tier = 'recliner';
      basePrice = 850;
    }

    // 3D coordinates calculation:
    // Screen is at z = 0, y = 2.2, width = 16m
    // Stadium seating steps up with each row
    const zPos = 4.5 + rowIndex * 1.45;
    const yPos = 0.2 + rowIndex * 0.35;

    for (let col = 1; col <= COLS_PER_ROW; col++) {
      const key = `${row}-${col}`;
      const isOccupied = OCCUPIED_SEAT_KEYS.has(key);

      // Add slight horizontal aisle gaps: left (1-3), center (4-11), right (12-14)
      let aisleShift = 0;
      if (col <= 3) {
        aisleShift = -0.55;
      } else if (col >= 12) {
        aisleShift = 0.55;
      }

      // Slight curvature in 3D: outer seats curve forward slightly toward the screen
      const normalizedCol = col - 7.5;
      const xPos = normalizedCol * 0.82 + aisleShift;
      const curveOffset = Math.abs(normalizedCol) * 0.08;
      const adjustedZ = zPos - curveOffset;

      seats.push({
        id: key,
        row,
        col,
        tier,
        price: basePrice,
        status: isOccupied ? 'sold' : 'available',
        x: xPos,
        y: yPos,
        z: adjustedZ,
      });
    }
  });

  return seats;
}

export interface SeatOpticalMetrics {
  tierBadge: 'UP CLOSE' | 'SWEET SPOT' | 'FULL PICTURE';
  tierColor: string;
  distanceMeters: number;
  fovDegrees: number;
  lateralOffsetMeters: number;
  lateralDescription: string;
  neckAngleDegrees: number;
  neckDescription: string;
  recommendedAudience: string;
  acousticScore: number;
  acousticSummary: string;
}

export function calculateSeatOpticalMetrics(seat: Seat): SeatOpticalMetrics {
  // Screen properties
  const screenZ = 0;
  const screenY = 2.4; // Screen center height
  const screenWidth = 14.0; // 14m wide IMAX canvas

  const eyeY = seat.y + 1.2; // Eye level sitting on seat
  const dx = seat.x;
  const dy = screenY - eyeY;
  const dz = seat.z - screenZ;

  // True Euclidean distance
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Field of view (angle subtended by the 14m screen from this seat)
  // FOV = 2 * arctan(screenWidth / (2 * dz)) in degrees
  const fovRad = 2 * Math.atan((screenWidth / 2) / dz);
  const fovDeg = Math.round((fovRad * 180) / Math.PI);

  // Lateral offset from screen center
  const absX = Math.abs(dx);
  let lateralDesc = 'Dead Centre (Zero Angle)';
  if (dx < -0.4) {
    lateralDesc = `${absX.toFixed(1)}m Left of Centre`;
  } else if (dx > 0.4) {
    lateralDesc = `${absX.toFixed(1)}m Right of Centre`;
  }

  // Vertical neck tilt (angle looking up at screen center)
  const neckRad = Math.atan2(dy, dz);
  const neckDeg = Math.round((neckRad * 180) / Math.PI);
  let neckDesc = 'Level Sightline (Relaxed)';
  if (neckDeg > 12) {
    neckDesc = `+${neckDeg}° Upward Tilt (High Immersion)`;
  } else if (neckDeg > 6) {
    neckDesc = `+${neckDeg}° Gentle Tilt`;
  }

  // Acoustic Dolby Atmos Sweet Spot Scoring (100% at Row F/G center, decreasing outwards)
  const lateralPenalty = (absX / 6.0) * 15;
  const rowDistancePenalty = Math.abs(dz - 11.5) * 2.2;
  const acousticScore = Math.max(76, Math.round(100 - lateralPenalty - rowDistancePenalty));
  let acousticSummary = 'Balanced Stereo-Surround';
  if (acousticScore >= 95) {
    acousticSummary = 'THX Reference Phased Sweet Spot';
  } else if (acousticScore >= 88) {
    acousticSummary = 'Excellent Dolby Atmos Spatial Image';
  }

  let tierBadge: 'UP CLOSE' | 'SWEET SPOT' | 'FULL PICTURE' = 'SWEET SPOT';
  let tierColor = '#10B981';
  let audience = 'Ideal balance of wide FOV and natural eye comfort.';

  if (['A', 'B', 'C'].includes(seat.row)) {
    tierBadge = 'UP CLOSE';
    tierColor = '#F59E0B';
    audience = 'Maximum IMAX peripheral vision fill for sensory immersion.';
  } else if (['D', 'E', 'F', 'G'].includes(seat.row)) {
    tierBadge = 'SWEET SPOT';
    tierColor = '#10B981';
    audience = 'Acoustic & visual sweet spot recommended by THX & Dolby.';
  } else {
    tierBadge = 'FULL PICTURE';
    tierColor = '#8B5CF6';
    audience = 'Full panoramic view with zero head turning and plush recliner.';
  }

  return {
    tierBadge,
    tierColor,
    distanceMeters: parseFloat(distance.toFixed(1)),
    fovDegrees: fovDeg,
    lateralOffsetMeters: parseFloat(absX.toFixed(1)),
    lateralDescription: lateralDesc,
    neckAngleDegrees: neckDeg,
    neckDescription: neckDesc,
    recommendedAudience: audience,
    acousticScore,
    acousticSummary,
  };
}
