import React, { useRef, useEffect } from 'react';
import { PlayerTrackData, BallTrackData } from '../types/var';

interface TacticalRadarProps {
  players: PlayerTrackData[];
  ball: BallTrackData;
  isImpactFrame: boolean;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
}

export const TacticalRadar: React.FC<TacticalRadarProps> = ({
  players,
  ball,
  isImpactFrame,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Pitch dimensions: 105m length, 68m width
    // Draw Pitch Background
    ctx.fillStyle = '#064e3b'; // Lush tactical dark green
    ctx.fillRect(0, 0, w, h);

    // Subtle pitch grass mowing stripes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const stripeCount = 10;
    const stripeWidth = w / stripeCount;
    for (let i = 0; i < stripeCount; i += 2) {
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);
    }

    // Touchlines & Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    const pad = 12;
    const pw = w - pad * 2;
    const ph = h - pad * 2;

    // Outer boundary line
    ctx.strokeRect(pad, pad, pw, ph);

    // Halfway line
    const midX = pad + pw / 2;
    ctx.beginPath();
    ctx.moveTo(midX, pad);
    ctx.lineTo(midX, pad + ph);
    ctx.stroke();

    // Center circle (9.15m radius -> scaled)
    const centerRadius = (9.15 / 68) * ph;
    ctx.beginPath();
    ctx.arc(midX, pad + ph / 2, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.beginPath();
    ctx.arc(midX, pad + ph / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Penalty Areas (16.5m depth, 40.3m wide)
    const penDepth = (16.5 / 105) * pw;
    const penWidth = (40.3 / 68) * ph;
    const penTopY = pad + (ph - penWidth) / 2;

    // Left Penalty Box
    ctx.strokeRect(pad, penTopY, penDepth, penWidth);
    // Right Penalty Box
    ctx.strokeRect(pad + pw - penDepth, penTopY, penDepth, penWidth);

    // Goal Areas (5.5m depth, 18.3m wide)
    const goalAreaDepth = (5.5 / 105) * pw;
    const goalAreaWidth = (18.3 / 68) * ph;
    const goalAreaTopY = pad + (ph - goalAreaWidth) / 2;
    ctx.strokeRect(pad, goalAreaTopY, goalAreaDepth, goalAreaWidth);
    ctx.strokeRect(pad + pw - goalAreaDepth, goalAreaTopY, goalAreaDepth, goalAreaWidth);

    // Helper to map pitch coordinates (0-105m, 0-68m) to canvas pixels
    const toCanvasX = (pitchX: number) => pad + (pitchX / 105) * pw;
    const toCanvasY = (pitchY: number) => pad + (pitchY / 68) * ph;

    // Draw Last Defender Line (Offside line)
    const homeDefenders = players.filter(p => p.team === 'home' && p.role !== 'goalkeeper');
    if (homeDefenders.length > 0) {
      const deepestX = Math.max(...homeDefenders.map(d => d.pitchX));
      const offsideX = toCanvasX(deepestX);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(offsideX, pad);
      ctx.lineTo(offsideX, pad + ph);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw Players
    players.forEach(p => {
      const cx = toCanvasX(p.pitchX);
      const cy = toCanvasY(p.pitchY);
      const isSelected = selectedPlayerId === p.id;
      const isFoulInvolved = p.isInvolvedInFoul;

      ctx.save();

      // Proximity halo on impact
      if (isImpactFrame && isFoulInvolved) {
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Player circle
      ctx.beginPath();
      ctx.arc(cx, cy, isSelected ? 6.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle =
        p.team === 'home'
          ? '#2563eb' // Blue
          : p.team === 'away'
          ? '#dc2626' // Red
          : '#eab308'; // Referee
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Heading vector
      if (p.speedKmh > 3) {
        const rad = (p.headingDeg * Math.PI) / 180;
        const vLen = Math.min(18, p.speedKmh * 0.6);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * vLen, cy + Math.sin(rad) * vLen);
        ctx.strokeStyle = p.team === 'home' ? '#93c5fd' : '#fca5a5';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Squad number
      ctx.font = 'bold 7px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.number > 0) {
        ctx.fillText(String(p.number), cx, cy);
      }

      ctx.restore();
    });

    // Draw Ball
    const bx = toCanvasX(ball.pitchX);
    const by = toCanvasY(ball.pitchY);

    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ball velocity trail
    if (ball.speedKmh > 10) {
      const rad = (ball.trajectoryAngleDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - Math.cos(rad) * 16, by - Math.sin(rad) * 16);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.stroke();
    }
    ctx.restore();
  }, [players, ball, isImpactFrame, selectedPlayerId]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900/60 p-2.5">
      <div className="flex items-center justify-between mb-1.5 px-1 text-xs">
        <span className="font-semibold text-neutral-300">2D Tactical Pitch Radar</span>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Home
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> Away
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" /> Ref
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-white border border-neutral-400" /> Ball
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={340}
        height={220}
        className="w-full h-auto rounded border border-neutral-800 cursor-pointer shadow-inner"
        onClick={e => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const cx = ((e.clientX - rect.left) / rect.width) * 105;
          const cy = ((e.clientY - rect.top) / rect.height) * 68;

          const clicked = players.find(p => {
            const dist = Math.hypot(p.pitchX - cx, p.pitchY - cy);
            return dist < 4.5;
          });
          onSelectPlayer(clicked ? clicked.id : null);
        }}
      />
      <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-neutral-400 font-mono">
        <span>Length: 105m</span>
        <span>Semi-Automated Optical Triangulation</span>
        <span>Width: 68m</span>
      </div>
    </div>
  );
};
