import React, { useState, useRef } from 'react';
import { Upload, Camera, Film, X, Check } from 'lucide-react';

interface UploadClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomMedia: (mediaUrl: string, title: string, incidentType: string) => void;
}

export const UploadClipModal: React.FC<UploadClipModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomMedia,
}) => {
  const [selectedTab, setSelectedTab] = useState<'file' | 'camera'>('file');
  const [customTitle, setCustomTitle] = useState('User Uploaded Foul Challenge');
  const [incidentType, setIncidentType] = useState('tackle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);
        handleStopCamera();
      }
    }
  };

  const handleApply = () => {
    if (previewUrl) {
      onLoadCustomMedia(previewUrl, customTitle, incidentType);
      handleStopCamera();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Load Custom Match Video or Live Feed
            </h3>
          </div>
          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => setSelectedTab('file')}
              className={`flex-1 py-1.5 font-medium rounded transition-colors ${
                selectedTab === 'file'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Upload Video / Snapshot
            </button>
            <button
              onClick={() => setSelectedTab('camera')}
              className={`flex-1 py-1.5 font-medium rounded transition-colors ${
                selectedTab === 'camera'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Live Camera Feed
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Incident Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Foul Play Incident Category
              </label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="tackle">High-Speed Slide Tackle (Law 12)</option>
                <option value="penalty">Penalty Area Contact / Trip (Law 12)</option>
                <option value="offside">Offside Leading to Goal (Law 11)</option>
                <option value="handball">Handball / Silhouette Expansion (Law 12)</option>
                <option value="dogso">DOGSO Last Defender Challenge (Law 12)</option>
                <option value="violent_conduct">Violent Conduct / Off-Ball Incident</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'file' ? (
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl cursor-pointer bg-neutral-900/30 transition-colors">
                <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                <span className="text-xs font-semibold text-neutral-300">
                  Select or drop match clip / image
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  Supports MP4, WebM, PNG, JPG
                </span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraActive && (
                  <span className="text-xs text-neutral-500">Camera inactive</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isCameraActive ? (
                  <button
                    onClick={handleStartCamera}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Webcam</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCaptureCamera}
                      className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                      Capture Incident Snapshot
                    </button>
                    <button
                      onClick={handleStopCamera}
                      className="py-1.5 px-3 rounded bg-neutral-800 text-neutral-400"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center gap-3">
              <div className="w-16 h-10 rounded overflow-hidden bg-black shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold text-neutral-200 block truncate">
                  Media Ready for Tracking & VAR Analysis
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Optical Pipeline Connected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!previewUrl}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Load into VAR Workstation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
