import React, { useRef, useEffect } from 'react';
import { PlayerTrackData, BallTrackData, TelestratorAnnotation } from '../types/var';

interface TelestratorCanvasProps {
  width: number;
  height: number;
  players: PlayerTrackData[];
  ball: BallTrackData;
  isImpactFrame: boolean;
  isKickPointFrame: boolean;
  showSkeletons: boolean;
  showTrajectories: boolean;
  showPlayerLabels: boolean;
  showOffsideLines: boolean;
  offsideDeltaCm?: number;
  activeTool: 'none' | 'pen' | 'arrow' | 'circle' | 'loupe' | 'offside';
  penColor: string;
  annotations: TelestratorAnnotation[];
  onAddAnnotation: (annotation: TelestratorAnnotation) => void;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
}

export const TelestratorCanvas: React.FC<TelestratorCanvasProps> = ({
  width,
  height,
  players,
  ball,
  isImpactFrame,
  isKickPointFrame,
  showSkeletons,
  showTrajectories,
  showPlayerLabels,
  showOffsideLines,
  offsideDeltaCm,
  activeTool,
  penColor,
  annotations,
  onAddAnnotation,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Render tracking overlays + user telestrator drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Player Tracking: Skeletons & Bounding Halos
    players.forEach(p => {
      const px = (p.screenX / 100) * width;
      const py = (p.screenY / 100) * height;
      const isSelected = selectedPlayerId === p.id;
      const isTackler = p.role === 'tackler' || (p.isInvolvedInFoul && p.team === 'home');
      const isVictim = p.role === 'victim' || (p.isInvolvedInFoul && p.team === 'away');

      // Player Base Ring / Ground Halo
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(px, py + 18, 22, 10, 0, 0, Math.PI * 2);
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeStyle = isTackler
        ? 'rgba(59, 130, 246, 0.9)' // Blue tackler
        : isVictim
        ? 'rgba(239, 68, 68, 0.9)' // Red victim
        : p.team === 'referee'
        ? 'rgba(234, 179, 8, 0.9)' // Yellow referee
        : 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Velocity Trajectory Vector
      if (showTrajectories && p.speedKmh > 5) {
        const angleRad = (p.headingDeg * Math.PI) / 180;
        const speedLen = Math.min(60, p.speedKmh * 1.6);
        const vx = px + Math.cos(angleRad) * speedLen;
        const vy = py + 18 + Math.sin(angleRad) * speedLen * 0.4;

        ctx.beginPath();
        ctx.moveTo(px, py + 18);
        ctx.lineTo(vx, vy);
        ctx.strokeStyle = isTackler ? '#60a5fa' : '#f87171';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        ctx.beginPath();
        ctx.arc(vx, vy, 3, 0, Math.PI * 2);
        ctx.fillStyle = isTackler ? '#60a5fa' : '#f87171';
        ctx.fill();
      }

      // Overhead Player Tag
      if (showPlayerLabels) {
        ctx.font = '10px "JetBrains Mono", monospace';
        const tagText = `${p.name} #${p.number} · ${p.speedKmh.toFixed(1)} km/h`;
        const textWidth = ctx.measureText(tagText).width;
        const tagX = px - textWidth / 2 - 6;
        const tagY = py - 42;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(tagX, tagY, textWidth + 12, 16);
        ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(tagX, tagY, textWidth + 12, 16);

        ctx.fillStyle = isTackler ? '#93c5fd' : isVictim ? '#fca5a5' : '#f1f5f9';
        ctx.fillText(tagText, tagX + 6, tagY + 11);
      }

      // Skeleton Rendering (29/17 Joint SAOT model)
      if (showSkeletons && p.skeleton) {
        const sk = p.skeleton;
        const toCoords = (j: { x: number; y: number }) => ({
          x: j.x * width,
          y: j.y * height,
        });

        const joints = [
          sk.head,
          sk.neck,
          sk.leftShoulder,
          sk.rightShoulder,
          sk.leftElbow,
          sk.rightElbow,
          sk.leftWrist,
          sk.rightWrist,
          sk.pelvis,
          sk.leftHip,
          sk.rightHip,
          sk.leftKnee,
          sk.rightKnee,
          sk.leftAnkle,
          sk.rightAnkle,
          sk.leftFoot,
          sk.rightFoot,
        ];

        // Draw Bones
        const bones = [
          [sk.head, sk.neck],
          [sk.neck, sk.pelvis],
          [sk.neck, sk.leftShoulder],
          [sk.neck, sk.rightShoulder],
          [sk.leftShoulder, sk.leftElbow],
          [sk.leftElbow, sk.leftWrist],
          [sk.rightShoulder, sk.rightElbow],
          [sk.rightElbow, sk.rightWrist],
          [sk.pelvis, sk.leftHip],
          [sk.pelvis, sk.rightHip],
          [sk.leftHip, sk.leftKnee],
          [sk.leftKnee, sk.leftAnkle],
          [sk.leftAnkle, sk.leftFoot],
          [sk.rightHip, sk.rightKnee],
          [sk.rightKnee, sk.rightAnkle],
          [sk.rightAnkle, sk.rightFoot],
        ];

        ctx.lineWidth = 2;
        ctx.strokeStyle = isTackler
          ? 'rgba(56, 189, 248, 0.75)'
          : isVictim
          ? 'rgba(244, 63, 94, 0.75)'
          : 'rgba(255, 255, 255, 0.4)';

        bones.forEach(([a, b]) => {
          const ptA = toCoords(a);
          const ptB = toCoords(b);
          ctx.beginPath();
          ctx.moveTo(ptA.x, ptA.y);
          ctx.lineTo(ptB.x, ptB.y);
          ctx.stroke();
        });

        // Draw Joint nodes
        joints.forEach(j => {
          const pt = toCoords(j);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // Contact point emphasis on tackler boot / victim shin during impact
        if (isImpactFrame && isTackler && sk.rightFoot) {
          const footPt = toCoords(sk.rightFoot);
          ctx.beginPath();
          ctx.arc(footPt.x, footPt.y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Caliper crosshair
          ctx.beginPath();
          ctx.moveTo(footPt.x - 20, footPt.y);
          ctx.lineTo(footPt.x + 20, footPt.y);
          ctx.moveTo(footPt.x, footPt.y - 20);
          ctx.lineTo(footPt.x, footPt.y + 20);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.stroke();

          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ef4444';
          ctx.fillText('STUDS IMPACT POINT [LAW 12.3]', footPt.x + 18, footPt.y - 6);
        }
      }

      ctx.restore();
    });

    // 2. Ball Tracking: 3D Halo, Height shadow, and Speed Arc
    const bx = (ball.screenX / 100) * width;
    const by = (ball.screenY / 100) * height;
    const shadowY = by + ball.pitchZ * 35;

    ctx.save();
    // Ball ground shadow
    ctx.beginPath();
    ctx.ellipse(bx, shadowY, 10, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 3D elevation connector line
    if (ball.pitchZ > 0.15) {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, shadowY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ball Marker Ring
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.strokeStyle = isKickPointFrame ? '#eab308' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ball Speed Tag
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bx + 12, by - 8, 70, 14);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(bx + 12, by - 8, 70, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`⚽ ${ball.speedKmh.toFixed(0)} km/h`, bx + 16, by + 2);

    ctx.restore();

    // 3. Calibrated Offside 3D Plane Line (IFAB Law 11)
    if (showOffsideLines && offsideDeltaCm !== undefined) {
      const def = players.find(p => p.role === 'last_defender');
      const att = players.find(p => p.role === 'receiver');

      if (def && att) {
        const defX = (def.screenX / 100) * width;
        const attX = (att.screenX / 100) * width;

        ctx.save();
        // Calibrated Pitch Offside Vanishing Lines
        // Blue Defender Virtual Line
        ctx.beginPath();
        ctx.moveTo(defX, 0);
        ctx.lineTo(defX, height);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Red Attacker Virtual Line
        ctx.beginPath();
        ctx.moveTo(attX, 0);
        ctx.lineTo(attX, height);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Delta shaded zone between lines
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(Math.min(defX, attX), 0, Math.abs(attX - defX), height);

        // Offside Tag
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const offsideText = `OFFSIDE DELTA: +${offsideDeltaCm.toFixed(1)} cm`;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(attX - 70, 24, 150, 22);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(attX - 70, 24, 150, 22);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(offsideText, attX - 62, 38);

        ctx.restore();
      }
    }

    // 4. Render User Telestrator Annotations
    annotations.forEach(ann => {
      ctx.save();
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.type === 'freehand' && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x * width, ann.points[0].y * height);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x * width, ann.points[i].y * height);
        }
        ctx.stroke();
      } else if (ann.type === 'arrow' && ann.points.length >= 2) {
        const p1 = { x: ann.points[0].x * width, y: ann.points[0].y * height };
        const p2 = { x: ann.points[1].x * width, y: ann.points[1].y * height };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = 14;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = ann.color;
        ctx.fill();
      } else if (ann.type === 'circle' && ann.points.length >= 2) {
        const p1 = { x: ann.points[0].x * width, y: ann.points[0].y * height };
        const p2 = { x: ann.points[1].x * width, y: ann.points[1].y * height };
        const r = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [
    width,
    height,
    players,
    ball,
    isImpactFrame,
    isKickPointFrame,
    showSkeletons,
    showTrajectories,
    showPlayerLabels,
    showOffsideLines,
    offsideDeltaCm,
    annotations,
    selectedPlayerId,
  ]);

  // Drawing mouse handlers for telestrator
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') {
      // Check if user clicked near a player to select them
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = ((e.clientX - rect.left) / width) * 100;
      const clickY = ((e.clientY - rect.top) / height) * 100;

      const clickedPlayer = players.find(p => {
        const dist = Math.hypot(p.screenX - clickX, p.screenY - clickY);
        return dist < 6;
      });
      onSelectPlayer(clickedPlayer ? clickedPlayer.id : null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y }];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeTool === 'none') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    if (activeTool === 'pen') {
      currentPointsRef.current.push({ x, y });
    } else if (activeTool === 'arrow' || activeTool === 'circle') {
      currentPointsRef.current[1] = { x, y };
    }
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || activeTool === 'none') return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: activeTool === 'pen' ? 'freehand' : activeTool === 'arrow' ? 'arrow' : 'circle',
        color: penColor,
        points: [...currentPointsRef.current],
      });
    }
    currentPointsRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 z-10 w-full h-full cursor-crosshair pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};
