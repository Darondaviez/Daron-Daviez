import React, { useState, useRef, useEffect } from 'react';
import { MatchIncident, TrackingFrame, TelestratorAnnotation } from '../types/var';
import { TelestratorCanvas } from './TelestratorCanvas';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  PenTool,
  MoveRight,
  Circle,
  Trash2,
  ZoomIn,
  Flame,
} from 'lucide-react';

interface VideoPlayerProps {
  incident: MatchIncident;
  currentFrame: TrackingFrame;
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  activeCamera: string;
  onSetFrameIndex: (idx: number) => void;
  onTogglePlay: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onSelectCamera: (camKey: string) => void;
  showSkeletons: boolean;
  showTrajectories: boolean;
  showPlayerLabels: boolean;
  showOffsideLines: boolean;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
  varBroadcastBanner: boolean;
  onToggleVarBanner: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  incident,
  currentFrame,
  currentFrameIndex,
  isPlaying,
  playbackSpeed,
  activeCamera,
  onSetFrameIndex,
  onTogglePlay,
  onSetPlaybackSpeed,
  onSelectCamera,
  showSkeletons,
  showTrajectories,
  showPlayerLabels,
  showOffsideLines,
  selectedPlayerId,
  onSelectPlayer,
  varBroadcastBanner,
  onToggleVarBanner,
}) => {
  const [activeTool, setActiveTool] = useState<'none' | 'pen' | 'arrow' | 'circle'>('none');
  const [penColor, setPenColor] = useState<string>('#eab308'); // Yellow by default
  const [annotations, setAnnotations] = useState<TelestratorAnnotation[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const currentCamFeed =
    (incident.cameraFeeds as any)[activeCamera] || incident.cameraFeeds.telephoto_contact;

  const handleStepFrame = (delta: number) => {
    const nextIdx = Math.max(0, Math.min(incident.totalFrames - 1, currentFrameIndex + delta));
    onSetFrameIndex(nextIdx);
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
  };

  return (
    <div className="flex flex-col bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
      {/* Top Video Toolbar: Camera Angles & VAR Broadcast Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-950 border-b border-neutral-800">
        {/* Camera Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {Object.entries(incident.cameraFeeds).map(([key, feed]) => {
            const isActive = activeCamera === key;
            return (
              <button
                key={key}
                onClick={() => onSelectCamera(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{feed.name.split('·')[1]?.trim() || feed.name}</span>
              </button>
            );
          })}
        </div>

        {/* Stadium Broadcast Banner Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVarBanner}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold font-mono rounded transition-colors ${
              varBroadcastBanner
                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>STADIUM BIG-SCREEN VAR</span>
          </button>
        </div>
      </div>

      {/* Main Video & Telestrator Viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black overflow-hidden select-none"
      >
        {/* Video Frame Image / Canvas */}
        <img
          src={currentCamFeed.poster}
          alt={currentCamFeed.name}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150 origin-[55%_60%]' : 'scale-100'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Big Screen VAR Official Stadium Banner Overlay */}
        {varBroadcastBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-2 bg-neutral-950/95 border-2 border-rose-500 rounded-lg shadow-2xl">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div className="text-center font-mono">
              <span className="text-xs tracking-widest text-neutral-400 uppercase block">
                OFFICIAL MATCH REVIEW
              </span>
              <span className="text-base font-black text-rose-400 tracking-wider">
                VAR CHECK IN PROGRESS: {incident.incidentType.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Telestrator and Real-time Tracking Canvas */}
        <TelestratorCanvas
          width={dimensions.width}
          height={dimensions.height}
          players={currentFrame.players}
          ball={currentFrame.ball}
          isImpactFrame={!!currentFrame.isPointOfImpact}
          isKickPointFrame={!!currentFrame.isKickPoint}
          showSkeletons={showSkeletons}
          showTrajectories={showTrajectories}
          showPlayerLabels={showPlayerLabels}
          showOffsideLines={showOffsideLines}
          offsideDeltaCm={currentFrame.offsideDeltaCm}
          activeTool={activeTool}
          penColor={penColor}
          annotations={annotations}
          onAddAnnotation={ann => setAnnotations(prev => [...prev, ann])}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayer={onSelectPlayer}
        />

        {/* Video OSD Metadata (Top-Left & Top-Right) */}
        <div className="absolute top-3 left-3 z-15 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-200">
            {incident.matchMinute}
          </div>
          <div className="px-2.5 py-1 rounded bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-neutral-300">
            {currentCamFeed.name}
          </div>
          {currentFrame.isPointOfImpact && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/90 border border-rose-800 text-[11px] font-mono font-bold text-rose-300 animate-pulse">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>POINT OF IMPACT</span>
            </div>
          )}
          {currentFrame.isKickPoint && (
            <div className="px-2.5 py-1 rounded bg-amber-950/90 border border-amber-800 text-[11px] font-mono font-bold text-amber-300">
              KICK POINT RELEASE
            </div>
          )}
        </div>

        {/* Video OSD Timecode & Frame Counter */}
        <div className="absolute top-3 right-3 z-15 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-neutral-200 tabular-nums">
            TC: {currentFrame.timecode} · F{currentFrameIndex + 1}/{incident.totalFrames}
          </div>
          <div className="px-2 py-1 rounded bg-neutral-950/80 border border-neutral-800 text-[10px] font-mono text-emerald-400">
            {incident.fps} FPS SYNC
          </div>
        </div>

        {/* Floating Loupe Toggle Button */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            title="Toggle Contact Loupe Zoom"
            className={`p-2 rounded-lg transition-colors border shadow-lg ${
              isZoomed
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-neutral-950/80 hover:bg-neutral-900 text-neutral-300 border-neutral-700'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Scrubber Timeline Bar */}
      <div className="px-4 py-2 bg-neutral-950/90 border-b border-neutral-800">
        <div className="relative flex items-center">
          {/* Keyframe Bookmarks */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-amber-400 rounded-sm z-10 pointer-events-none"
            style={{ left: `${(incident.kickPointFrame / incident.totalFrames) * 100}%` }}
            title="Kick Point"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-rose-500 rounded-sm z-10 pointer-events-none shadow-sm shadow-rose-500"
            style={{ left: `${(incident.impactFrame / incident.totalFrames) * 100}%` }}
            title="Contact Point of Impact"
          />

          <input
            type="range"
            min={0}
            max={incident.totalFrames - 1}
            value={currentFrameIndex}
            onChange={e => onSetFrameIndex(Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none"
          />
        </div>

        {/* Timeline Keyframe Tags */}
        <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-neutral-400">
          <button
            onClick={() => onSetFrameIndex(0)}
            className="hover:text-neutral-200 transition-colors"
          >
            00:00.00
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onSetFrameIndex(incident.kickPointFrame)}
              className="flex items-center gap-1 text-amber-400 hover:underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Kick Point (F{incident.kickPointFrame})</span>
            </button>
            <button
              onClick={() => onSetFrameIndex(incident.impactFrame)}
              className="flex items-center gap-1 text-rose-400 hover:underline font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Contact Impact (F{incident.impactFrame})</span>
            </button>
          </div>

          <button
            onClick={() => onSetFrameIndex(incident.totalFrames - 1)}
            className="hover:text-neutral-200 transition-colors"
          >
            {incident.totalDurationSeconds.toFixed(2)}s
          </button>
        </div>
      </div>

      {/* Bottom Transport Controls & Telestrator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-950">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Step Back 1 Frame */}
          <button
            onClick={() => handleStepFrame(-1)}
            title="Step back 1 frame (1/50s)"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => handleStepFrame(1)}
            title="Step forward 1 frame (1/50s)"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Playback Speed Selector */}
          <div className="flex items-center gap-1 ml-2 p-1 bg-neutral-900 rounded-lg border border-neutral-800 font-mono text-[11px]">
            {[0.1, 0.25, 0.5, 1.0].map(s => (
              <button
                key={s}
                onClick={() => onSetPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === s
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Telestrator Drawing Tools */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400">Telestrator:</span>
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveTool(activeTool === 'pen' ? 'none' : 'pen')}
              title="Draw Freehand Pen"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'pen'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'arrow' ? 'none' : 'arrow')}
              title="Draw Vector Arrow"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'arrow'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'circle' ? 'none' : 'circle')}
              title="Draw Highlight Circle"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'circle'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Chooser */}
          <div className="flex items-center gap-1">
            {['#eab308', '#ef4444', '#38bdf8', '#ffffff'].map(c => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  penColor === c ? 'scale-125 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Clear Telestrator */}
          {annotations.length > 0 && (
            <button
              onClick={handleClearAnnotations}
              title="Clear all annotations"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
