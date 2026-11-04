import React from 'react';
import { MatchIncident, TrackingFrame } from '../types/var';
import { Camera, Maximize2 } from 'lucide-react';

interface MultiCamGridProps {
  incident: MatchIncident;
  currentFrame: TrackingFrame;
  currentFrameIndex: number;
  onSelectCamera: (camKey: string) => void;
  onSetFrameIndex: (idx: number) => void;
}

export const MultiCamGrid: React.FC<MultiCamGridProps> = ({
  incident,
  currentFrame,
  currentFrameIndex,
  onSelectCamera,
  onSetFrameIndex,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-sm font-bold text-neutral-100">
            Synchronized Quad-Camera Multi-Angle Matrix
          </h2>
          <p className="text-xs text-neutral-400">
            All 4 angles locked to frame {currentFrameIndex + 1}/{incident.totalFrames} · Timecode: {currentFrame.timecode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(incident.cameraFeeds).map(([key, feed]) => (
          <div
            key={key}
            className="group relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-lg cursor-pointer hover:border-blue-500/60 transition-colors"
            onClick={() => onSelectCamera(key)}
          >
            <img
              src={feed.poster}
              alt={feed.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Camera Tag */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-950/85 border border-neutral-800 text-[11px] font-mono text-neutral-200">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>{feed.name}</span>
            </div>

            {/* Timecode */}
            <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-neutral-950/85 border border-neutral-800 text-[10px] font-mono text-neutral-400">
              TC: {currentFrame.timecode}
            </div>

            {/* Hover Focus Button */}
            <div className="absolute inset-0 bg-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Focus Angle in Workstation</span>
              </div>
            </div>

            {/* Bottom Feed Description */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-[11px] text-neutral-300 line-clamp-1">
              {feed.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
