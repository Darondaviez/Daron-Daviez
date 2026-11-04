import React, { useState, useEffect, useRef } from 'react';
import { MATCH_INCIDENTS } from './data/incidents';
import { MatchIncident, TrackingFrame, AIAnalysisResult } from './types/var';
import { calculateKinematics } from './utils/trackingEngine';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { TacticalRadar } from './components/TacticalRadar';
import { TrackingTelemetryPanel } from './components/TrackingTelemetryPanel';
import { AiAnalysisPanel } from './components/AiAnalysisPanel';
import { MultiCamGrid } from './components/MultiCamGrid';
import { LawGuide } from './components/LawGuide';
import { PitchsideReviewModal } from './components/PitchsideReviewModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { UploadClipModal } from './components/UploadClipModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { useFirebaseVAR } from './hooks/useFirebaseVAR';
import { ChevronRight, Shield, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<MatchIncident[]>(MATCH_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(MATCH_INCIDENTS[0].id);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(65); // default on impact frame
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);
  const [activeCamera, setActiveCamera] = useState<string>('telephoto_contact');
  const [activeTab, setActiveTab] = useState<string>('workstation');

  // Tracking visualization toggles
  const [showSkeletons, setShowSkeletons] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [showPlayerLabels, setShowPlayerLabels] = useState<boolean>(true);
  const [showOffsideLines, setShowOffsideLines] = useState<boolean>(true);
  const [varBroadcastBanner, setVarBroadcastBanner] = useState<boolean>(false);

  // Selected player inspector
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // AI analysis state
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [finalDecision, setFinalDecision] = useState<string | null>(null);

  // Modals
  const [isPitchsideModalOpen, setIsPitchsideModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  // Firebase Cloud persistence & authentication
  const {
    currentUser,
    savedReviews,
    isSaving,
    loginWithGoogle,
    logoutUser,
    logReviewDecision,
  } = useFirebaseVAR();

  // Active Incident
  const currentIncident =
    incidents.find(inc => inc.id === selectedIncidentId) || incidents[0];

  // Active Tracking Frame
  const currentFrame: TrackingFrame =
    currentIncident.trackingFrames[currentFrameIndex] ||
    currentIncident.trackingFrames[0];

  // Kinematic calculations
  const kinematics = calculateKinematics(currentFrame);

  // Synchronized Playback Loop
  const lastTimeRef = useRef<number>(performance.now());
  const frameAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        frameAccumulatorRef.current += dt * currentIncident.fps * playbackSpeed;
        if (frameAccumulatorRef.current >= 1) {
          const framesToAdvance = Math.floor(frameAccumulatorRef.current);
          frameAccumulatorRef.current -= framesToAdvance;

          setCurrentFrameIndex(prev => {
            const next = prev + framesToAdvance;
            if (next >= currentIncident.totalFrames) {
              return 0; // loop back
            }
            return next;
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, currentIncident]);

  // Reset or change incident
  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    const inc = incidents.find(i => i.id === id);
    if (inc) {
      setCurrentFrameIndex(inc.impactFrame);
      setAiResult(null);
      setFinalDecision(null);
    }
  };

  // Trigger Gemini AI Real-Time Analysis
  const handleTriggerAiAnalysis = async () => {
    setIsLoadingAi(true);

    try {
      const currentCamFeed = (currentIncident.cameraFeeds as any)[activeCamera];

      // Convert current poster image to base64 or pass frame metadata
      let snapshotBase64: string | null = null;
      try {
        const res = await fetch(currentCamFeed.poster);
        const blob = await res.blob();
        snapshotBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Could not read image for base64 payload:', e);
      }

      const response = await fetch('/api/var/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentTitle: currentIncident.title,
          incidentType: currentIncident.incidentType,
          matchMinute: currentIncident.matchMinute,
          cameraAngle: activeCamera,
          snapshotBase64,
          timecode: currentFrame.timecode,
          manualNotes: `Frame ${currentFrameIndex + 1}/${currentIncident.totalFrames}. Closing speed: ${kinematics.closingSpeedKmh} km/h. Elevation: ${kinematics.tacklerElevationCm} cm. Clean ball won: ${kinematics.isBallWonCleanly}.`,
          defenderTeam: 'Home Blue',
          attackerTeam: 'Away Red',
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAiResult(data.data);
      } else {
        // Fallback to rich pre-calculated domain analysis
        setAiResult(currentIncident.defaultAiVerdict);
      }
    } catch (err) {
      console.error('AI Analysis failed, fallback to default verdict:', err);
      setAiResult(currentIncident.defaultAiVerdict);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Custom User Media Upload
  const handleLoadCustomMedia = (mediaUrl: string, title: string, incidentType: string) => {
    const newInc: MatchIncident = {
      id: `custom-${Date.now()}`,
      title,
      matchFixture: 'USER TEST FIXTURE // CUSTOM UPLOAD',
      matchMinute: "45' 00\"",
      incidentType: incidentType as any,
      initialOnFieldCall: 'Under VAR Investigation',
      description: 'User uploaded custom video sequence or webcam capture for AI foul play analysis.',
      totalDurationSeconds: 2.4,
      totalFrames: 120,
      fps: 50,
      kickPointFrame: 30,
      impactFrame: 60,
      cameraFeeds: {
        broadcast_wide: {
          name: 'Cam 1 · Upload Angle',
          poster: mediaUrl,
          description: 'Primary custom camera perspective',
        },
        telephoto_contact: {
          name: 'Cam 2 · Calibrated Tracking',
          poster: mediaUrl,
          description: 'Optical analysis perspective',
        },
        reverse_pitchside: {
          name: 'Cam 3 · Sideline Review',
          poster: mediaUrl,
          description: 'Reconstructed review angle',
        },
        high_endzone: {
          name: 'Cam 4 · Hawk-Eye Grid',
          poster: mediaUrl,
          description: 'Multi-tracking calibration',
        },
      },
      trackingFrames: currentIncident.trackingFrames,
      defaultAiVerdict: {
        recommendedDecision: 'YELLOW_CARD_RECKLESS',
        decisionLabel: 'Recommend OFR: Caution / Yellow Card (Reckless Challenge)',
        varAction: 'OFR_RECOMMENDED',
        lawCitation: 'IFAB Law 12.1: Reckless Challenge - Disregarding danger to opponent',
        confidenceScore: 91.2,
        severityLevel: 'Moderate',
        biomechanicalMetrics: {
          studsExposed: false,
          contactHeight: 'Ankle level (6.2 cm)',
          legExtension: 'Bent leg barrier challenge',
          ballTouchPrior: false,
          forceVelocityEstimate: '18.4 km/h closing momentum',
          endangersSafety: false,
        },
        contactPointDescription: 'Contact made with opponent foot/ankle during late sliding contest.',
        freezeFrameTimestamp: '01:12.00 (Frame 60)',
        refereeIntercomAudioScript: 'Referee, VAR checking the incident. The replay confirms reckless contact on the opponent ankle with no touch on the ball. Recommend an on-field review.',
        officialRationale: 'Clear and obvious error. The challenge was reckless and prevented continuation of play without touching the ball.',
      },
    };

    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);
    setCurrentFrameIndex(60);
    setAiResult(null);
    setFinalDecision(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Strict Top Bar Contract (§2) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
      />

      {/* Incident Switcher Strip */}
      <div className="bg-neutral-900/60 border-b border-neutral-800 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0">
            Active Fixture:
          </span>
          <span className="text-xs font-bold font-mono text-neutral-200 shrink-0">
            {currentIncident.matchFixture}
          </span>
        </div>

        {/* Incident Scenario Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          {incidents.map(inc => (
            <button
              key={inc.id}
              onClick={() => handleSelectIncident(inc.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedIncidentId === inc.id
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              {inc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-6 max-w-[1700px] w-full mx-auto">
        {activeTab === 'workstation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Main Synchronized Video Player & Transport Bar */}
            <div className="lg:col-span-8 space-y-4">
              <VideoPlayer
                incident={currentIncident}
                currentFrame={currentFrame}
                currentFrameIndex={currentFrameIndex}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                activeCamera={activeCamera}
                onSetFrameIndex={setCurrentFrameIndex}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onSetPlaybackSpeed={setPlaybackSpeed}
                onSelectCamera={setActiveCamera}
                showSkeletons={showSkeletons}
                showTrajectories={showTrajectories}
                showPlayerLabels={showPlayerLabels}
                showOffsideLines={showOffsideLines}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                varBroadcastBanner={varBroadcastBanner}
                onToggleVarBanner={() => setVarBroadcastBanner(!varBroadcastBanner)}
              />

              {/* Sub-panel: Quick Angle Synchronizer Bar */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(currentIncident.cameraFeeds).map(([key, feed]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCamera(key)}
                    className={`p-2 rounded-lg text-left border transition-all ${
                      activeCamera === key
                        ? 'border-blue-500 bg-blue-950/20 shadow-sm'
                        : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-neutral-200 truncate">
                      {feed.name.split('·')[0]}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate">
                      {feed.name.split('·')[1] || feed.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 4 Columns: Tactical Pitch Radar, Kinematics & Gemini AI Panel */}
            <div className="lg:col-span-4 space-y-5">
              {/* 2D Tactical Pitch Radar */}
              <TacticalRadar
                players={currentFrame.players}
                ball={currentFrame.ball}
                isImpactFrame={!!currentFrame.isPointOfImpact}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
              />

              {/* Biomechanical Kinematics Telemetry */}
              <TrackingTelemetryPanel
                frame={currentFrame}
                kinematics={kinematics}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                showSkeletons={showSkeletons}
                onToggleSkeletons={() => setShowSkeletons(!showSkeletons)}
                showTrajectories={showTrajectories}
                onToggleTrajectories={() => setShowTrajectories(!showTrajectories)}
                showOffsideLines={showOffsideLines}
                onToggleOffsideLines={() => setShowOffsideLines(!showOffsideLines)}
              />

              {/* Gemini AI Foul Play Analysis Panel */}
              <AiAnalysisPanel
                incident={currentIncident}
                currentFrame={currentFrame}
                activeCamera={activeCamera}
                aiResult={aiResult}
                isLoading={isLoadingAi}
                onTriggerAnalysis={handleTriggerAiAnalysis}
                onOpenPitchsideOfr={() => setIsPitchsideModalOpen(true)}
                onOpenReport={() => setIsReportModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Multi-Camera Tab */}
        {activeTab === 'multicam' && (
          <MultiCamGrid
            incident={currentIncident}
            currentFrame={currentFrame}
            currentFrameIndex={currentFrameIndex}
            onSelectCamera={cam => {
              setActiveCamera(cam);
              setActiveTab('workstation');
            }}
            onSetFrameIndex={setCurrentFrameIndex}
          />
        )}

        {/* Tactical Radar Full View Tab */}
        {activeTab === 'radar' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <TacticalRadar
              players={currentFrame.players}
              ball={currentFrame.ball}
              isImpactFrame={!!currentFrame.isPointOfImpact}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
            />
            <TrackingTelemetryPanel
              frame={currentFrame}
              kinematics={kinematics}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              showSkeletons={showSkeletons}
              onToggleSkeletons={() => setShowSkeletons(!showSkeletons)}
              showTrajectories={showTrajectories}
              onToggleTrajectories={() => setShowTrajectories(!showTrajectories)}
              showOffsideLines={showOffsideLines}
              onToggleOffsideLines={() => setShowOffsideLines(!showOffsideLines)}
            />
          </div>
        )}

        {/* Law 12 Protocol Tab */}
        {activeTab === 'laws' && <LawGuide />}
      </main>

      {/* Pitchside Review (OFR) Station Modal */}
      <PitchsideReviewModal
        isOpen={isPitchsideModalOpen}
        onClose={() => setIsPitchsideModalOpen(false)}
        incident={currentIncident}
        onConfirmRefereeDecision={verdict => {
          setFinalDecision(verdict);
          setVarBroadcastBanner(true);
          logReviewDecision(
            currentIncident,
            verdict,
            verdict === currentIncident.defaultAiVerdict.recommendedDecision ? 'CONFIRMED' : 'OVERTURNED'
          );
        }}
      />

      {/* Incident Dossier Report Modal */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        incident={currentIncident}
        aiResult={aiResult}
        finalDecision={finalDecision}
        savedReviews={savedReviews}
        currentUserEmail={currentUser?.email}
      />

      {/* Upload Custom Clip / WebCam Modal */}
      <UploadClipModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadCustomMedia={handleLoadCustomMedia}
      />

      {/* Android APK & WebAPK Deployment Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
