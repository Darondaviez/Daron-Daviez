import React from 'react';
import { PlayerTrackData, BallTrackData, TrackingFrame } from '../types/var';
import { KinematicMetrics } from '../utils/trackingEngine';
import { Gauge, Activity, Footprints, ShieldAlert, Target, Compass } from 'lucide-react';

interface TrackingTelemetryPanelProps {
  frame: TrackingFrame;
  kinematics: KinematicMetrics;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
  showSkeletons: boolean;
  onToggleSkeletons: () => void;
  showTrajectories: boolean;
  onToggleTrajectories: () => void;
  showOffsideLines: boolean;
  onToggleOffsideLines: () => void;
}

export const TrackingTelemetryPanel: React.FC<TrackingTelemetryPanelProps> = ({
  frame,
  kinematics,
  selectedPlayerId,
  onSelectPlayer,
  showSkeletons,
  onToggleSkeletons,
  showTrajectories,
  onToggleTrajectories,
  showOffsideLines,
  onToggleOffsideLines,
}) => {
  const selectedPlayer = frame.players.find(p => p.id === selectedPlayerId) || frame.players[0];
  const tackler = frame.players.find(p => p.role === 'tackler') || frame.players[0];
  const victim = frame.players.find(p => p.role === 'victim') || frame.players[1];

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Tracking Visualization Toggles */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
        <button
          onClick={onToggleSkeletons}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            showSkeletons
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          29-Joint Skeleton
        </button>
        <button
          onClick={onToggleTrajectories}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            showTrajectories
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          Velocity Vectors
        </button>
        <button
          onClick={onToggleOffsideLines}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            showOffsideLines
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          Offside Calibrator
        </button>
      </div>

      {/* Primary Kinematic Foul Gauges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Closing Speed */}
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" /> Closing Velocity
            </span>
            <span className="text-[10px] font-mono text-neutral-500">REL SPEED</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-blue-400 tabular-nums">
              {kinematics.closingSpeedKmh}
            </span>
            <span className="text-neutral-400 text-[11px]">km/h</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                kinematics.closingSpeedKmh > 25
                  ? 'bg-rose-500'
                  : kinematics.closingSpeedKmh > 18
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (kinematics.closingSpeedKmh / 35) * 100)}%` }}
            />
          </div>
        </div>

        {/* Impact Force */}
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> Impact Impulse
            </span>
            <span className="text-[10px] font-mono text-neutral-500">FORCE</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {kinematics.impactImpulseKn}
            </span>
            <span className="text-neutral-400 text-[11px]">kN</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                kinematics.impactImpulseKn > 2.5
                  ? 'bg-rose-500'
                  : kinematics.impactImpulseKn > 1.5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (kinematics.impactImpulseKn / 4) * 100)}%` }}
            />
          </div>
        </div>

        {/* Boot Elevation Above Pitch */}
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-amber-400" /> Contact Height
            </span>
            <span className="text-[10px] font-mono text-neutral-500">TURF OFFSET</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              +{kinematics.tacklerElevationCm}
            </span>
            <span className="text-neutral-400 text-[11px]">cm above turf</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">
            {kinematics.tacklerElevationCm > 12 ? '⚠️ Above ankle collar (Law 12.3)' : 'Low ground-level contact'}
          </span>
        </div>

        {/* Clean Ball Contest */}
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Ball Deviation
            </span>
            <span className="text-[10px] font-mono text-neutral-500">VECTOR</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              {frame.ball.speedKmh.toFixed(0)}
            </span>
            <span className="text-neutral-400 text-[11px]">km/h</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">
            {frame.isPointOfImpact ? 'Ball untouched prior to player contact' : 'Traveling on natural arc'}
          </span>
        </div>
      </div>

      {/* DOGSO & Spatial Defender Depth */}
      <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> DOGSO Evaluation (Law 12.3)
          </span>
          <span className="font-mono text-amber-400 font-bold">{kinematics.dogsoRiskScore}% Risk</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
          <div>
            Distance to Goal: <span className="font-mono text-neutral-200">{kinematics.distanceToGoalMeters}m</span>
          </div>
          <div>
            Defenders Covering: <span className="font-mono text-neutral-200">{kinematics.defendersBehindBall} players</span>
          </div>
        </div>
      </div>

      {/* Selected Player Detailed Biometrics */}
      {selectedPlayer && (
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  selectedPlayer.team === 'home'
                    ? 'bg-blue-500'
                    : selectedPlayer.team === 'away'
                    ? 'bg-red-500'
                    : 'bg-yellow-400'
                }`}
              />
              <span className="font-bold text-neutral-100">
                {selectedPlayer.name} #{selectedPlayer.number}
              </span>
            </div>
            <span className="font-mono text-[11px] text-neutral-400 uppercase">
              {selectedPlayer.role}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-1.5 bg-neutral-950/60 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">SPEED</span>
              <span className="text-sm font-semibold text-neutral-200">
                {selectedPlayer.speedKmh.toFixed(1)} <span className="text-[10px] font-normal">km/h</span>
              </span>
            </div>
            <div className="p-1.5 bg-neutral-950/60 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">ACCEL</span>
              <span className="text-sm font-semibold text-neutral-200">
                {selectedPlayer.acceleration > 0 ? `+${selectedPlayer.acceleration}` : selectedPlayer.acceleration} <span className="text-[10px] font-normal">m/s²</span>
              </span>
            </div>
            <div className="p-1.5 bg-neutral-950/60 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">HEADING</span>
              <span className="text-sm font-semibold text-neutral-200">
                {selectedPlayer.headingDeg}°
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tracked Roster Quick Selector */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-neutral-400 block px-0.5">
          Tracked Match Entities ({frame.players.length} players + ball)
        </span>
        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
          {frame.players.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPlayer(p.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors font-mono text-[11px] ${
                selectedPlayerId === p.id
                  ? 'bg-blue-900/40 border border-blue-500/50 text-blue-200'
                  : 'bg-neutral-900/40 hover:bg-neutral-800/60 text-neutral-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    p.team === 'home' ? 'bg-blue-400' : p.team === 'away' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}
                />
                <span className="truncate">
                  {p.name} #{p.number}
                </span>
                {p.isInvolvedInFoul && (
                  <span className="text-[9px] px-1 bg-red-950 text-red-300 rounded border border-red-800">
                    FOUL
                  </span>
                )}
              </div>
              <span className="text-neutral-400 shrink-0">{p.speedKmh.toFixed(1)} km/h</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
