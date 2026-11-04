import React, { useState } from 'react';
import { MatchIncident, TrackingFrame, AIAnalysisResult } from '../types/var';
import { ShieldCheck, AlertTriangle, Radio, Volume2, Sparkles, CheckCircle2, XCircle, ArrowRight, Footprints } from 'lucide-react';

interface AiAnalysisPanelProps {
  incident: MatchIncident;
  currentFrame: TrackingFrame;
  activeCamera: string;
  aiResult: AIAnalysisResult | null;
  isLoading: boolean;
  onTriggerAnalysis: () => void;
  onOpenPitchsideOfr: () => void;
  onOpenReport: () => void;
}

export const AiAnalysisPanel: React.FC<AiAnalysisPanelProps> = ({
  incident,
  currentFrame,
  activeCamera,
  aiResult,
  isLoading,
  onTriggerAnalysis,
  onOpenPitchsideOfr,
  onOpenReport,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const result = aiResult || incident.defaultAiVerdict;

  // Speech synthesis for official VAR radio intercom
  const handlePlayRadioIntercom = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const script = result.refereeIntercomAudioScript;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Try to find a crisp voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('Google')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const getDecisionTheme = (decision: string) => {
    switch (decision) {
      case 'RED_CARD_SERIOUS_FOUL_PLAY':
      case 'RED_CARD_VIOLENT_CONDUCT':
        return {
          bg: 'bg-red-950/70 border-red-800 text-red-200',
          badge: 'bg-red-900 text-red-100 border-red-700',
          accent: 'text-red-400',
        };
      case 'YELLOW_CARD_RECKLESS':
        return {
          bg: 'bg-amber-950/70 border-amber-800 text-amber-200',
          badge: 'bg-amber-900 text-amber-100 border-amber-700',
          accent: 'text-amber-400',
        };
      case 'PENALTY_AWARDED':
        return {
          bg: 'bg-blue-950/70 border-blue-800 text-blue-200',
          badge: 'bg-blue-900 text-blue-100 border-blue-700',
          accent: 'text-blue-400',
        };
      case 'OFFSIDE_OVERTURN':
        return {
          bg: 'bg-purple-950/70 border-purple-800 text-purple-200',
          badge: 'bg-purple-900 text-purple-100 border-purple-700',
          accent: 'text-purple-400',
        };
      default:
        return {
          bg: 'bg-emerald-950/70 border-emerald-800 text-emerald-200',
          badge: 'bg-emerald-900 text-emerald-100 border-emerald-700',
          accent: 'text-emerald-400',
        };
    }
  };

  const theme = getDecisionTheme(result.recommendedDecision);

  return (
    <div className="space-y-4">
      {/* Header and Trigger Action */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-neutral-100">
              VAR AI Foul Play Engine
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Real-time IFAB Law 12 & 11 Biomechanical Evaluation
          </p>
        </div>

        <button
          onClick={onTriggerAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Frame...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Active Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Recommended Ruling Card */}
      <div className={`p-4 rounded-xl border ${theme.bg} space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase opacity-80 block">
              Official VAR Recommendation
            </span>
            <div className="text-base font-extrabold tracking-tight mt-0.5">
              {result.decisionLabel}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-neutral-400 block">AI CONFIDENCE</span>
            <span className="text-lg font-bold font-mono tabular-nums text-neutral-100">
              {result.confidenceScore.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="text-xs opacity-90 leading-relaxed font-mono">
          {result.lawCitation}
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
          <span className="text-xs text-neutral-400">Action:</span>
          <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-700">
            {result.varAction === 'OFR_RECOMMENDED' ? '📢 ON-FIELD REVIEW (OFR)' : '✅ CHECK COMPLETE'}
          </span>
          <span className="text-xs text-neutral-400 ml-auto">Severity:</span>
          <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-700">
            {result.severityLevel}
          </span>
        </div>
      </div>

      {/* IFAB Law 12 Biomechanical Checklist */}
      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2.5">
        <span className="text-xs font-semibold text-neutral-300 block">
          IFAB Law 12 Criteria Checklist
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
            {result.biomechanicalMetrics.studsExposed ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <span className="text-[10px] text-neutral-400 block font-mono">STUDS EXPOSED</span>
              <span className="font-semibold text-neutral-200">
                {result.biomechanicalMetrics.studsExposed ? 'Yes · High Risk' : 'No · Boot Grounded'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
            <Footprints className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 block font-mono">POINT OF CONTACT</span>
              <span className="font-semibold text-neutral-200 truncate">
                {result.biomechanicalMetrics.contactHeight}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
            {result.biomechanicalMetrics.endangersSafety ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <span className="text-[10px] text-neutral-400 block font-mono">ENDANGERS SAFETY</span>
              <span className="font-semibold text-neutral-200">
                {result.biomechanicalMetrics.endangersSafety ? 'Excessive Force' : 'Controlled'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
            {result.biomechanicalMetrics.ballTouchPrior ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="text-[10px] text-neutral-400 block font-mono">CLEAN BALL TOUCH</span>
              <span className="font-semibold text-neutral-200">
                {result.biomechanicalMetrics.ballTouchPrior ? 'Touched Ball' : 'No Ball Contact'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Point Description */}
        <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 text-[11px] leading-relaxed text-neutral-300">
          <span className="font-semibold text-amber-400 font-mono block mb-0.5">
            Biomechanical Assessment:
          </span>
          {result.contactPointDescription}
        </div>
      </div>

      {/* VAR Intercom Radio Audio Transcript & Playback */}
      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-300">
              VAR Intercom Radio Transcript
            </span>
          </div>
          <button
            onClick={handlePlayRadioIntercom}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Stop Radio' : 'Listen Intercom'}</span>
          </button>
        </div>

        <div className="p-2.5 rounded bg-neutral-950/90 border border-neutral-800/90 font-mono text-[11px] text-emerald-400/90 leading-relaxed italic">
          "{result.refereeIntercomAudioScript}"
        </div>
      </div>

      {/* Actions: Open Pitchside Review (OFR) or Generate Report */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onOpenPitchsideOfr}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
        >
          <span>Pitchside Review Mode (OFR)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onOpenReport}
          className="px-3 py-2 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
        >
          Incident Report
        </button>
      </div>
    </div>
  );
};
