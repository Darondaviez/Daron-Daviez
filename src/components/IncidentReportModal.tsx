import React from 'react';
import { MatchIncident, AIAnalysisResult } from '../types/var';
import { X, Printer, FileText, Cloud, CheckCircle2 } from 'lucide-react';
import { SavedReviewRecord } from '../hooks/useFirebaseVAR';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: MatchIncident;
  aiResult: AIAnalysisResult | null;
  finalDecision: string | null;
  savedReviews?: SavedReviewRecord[];
  currentUserEmail?: string | null;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  incident,
  aiResult,
  finalDecision,
  savedReviews = [],
  currentUserEmail,
}) => {
  if (!isOpen) return null;

  const result = aiResult || incident.defaultAiVerdict;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Official VAR Incident Dossier & Technical Report
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                FIFA / IFAB VAR Protocol Form #VAR-2026-09
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 font-sans text-xs">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 font-mono text-[11px]">
            <div>
              <span className="text-neutral-500 block">FIXTURE</span>
              <span className="font-bold text-neutral-200">{incident.matchFixture}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">MATCH TIME</span>
              <span className="font-bold text-neutral-200">{incident.matchMinute}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">REVIEW STATUS</span>
              <span className="font-bold text-emerald-400">CHECK CONCLUDED</span>
            </div>
            <div>
              <span className="text-neutral-500 block">FINAL DECISION</span>
              <span className="font-bold text-rose-400">
                {finalDecision || result.decisionLabel}
              </span>
            </div>
          </div>

          {/* Cloud Firestore Storage Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Firebase Cloud Firestore Database Connected</span>
            </div>
            <div className="font-mono text-[10px] text-blue-300">
              {currentUserEmail ? `Referee: ${currentUserEmail}` : 'Anonymous / Offline Mode'}
            </div>
          </div>

          {/* Incident Overview & Initial On-Field Call */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] font-mono">
              1. Incident Context & Initial Call
            </h4>
            <div className="p-3 bg-neutral-900/40 rounded-lg border border-neutral-800 space-y-1 leading-relaxed">
              <p><strong>Description:</strong> {incident.description}</p>
              <p><strong>Initial Call on Pitch:</strong> {incident.initialOnFieldCall}</p>
            </div>
          </div>

          {/* Biomechanical Optical Tracking Evidence */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] font-mono">
              2. Semi-Automated Optical Tracking Biomechanics
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-neutral-900/40 rounded border border-neutral-800">
                <span className="text-neutral-500 block">CONTACT ELEVATION</span>
                <span className="text-neutral-200 font-bold">{result.biomechanicalMetrics.contactHeight}</span>
              </div>
              <div className="p-2.5 bg-neutral-900/40 rounded border border-neutral-800">
                <span className="text-neutral-500 block">STUDS EXPOSURE</span>
                <span className="text-neutral-200 font-bold">
                  {result.biomechanicalMetrics.studsExposed ? 'Confirmed Exposed' : 'Grounded'}
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900/40 rounded border border-neutral-800">
                <span className="text-neutral-500 block">MOMENTUM & IMPULSE</span>
                <span className="text-neutral-200 font-bold">{result.biomechanicalMetrics.forceVelocityEstimate}</span>
              </div>
              <div className="p-2.5 bg-neutral-900/40 rounded border border-neutral-800">
                <span className="text-neutral-500 block">BALL CONTEST CLEANLINESS</span>
                <span className="text-neutral-200 font-bold">
                  {result.biomechanicalMetrics.ballTouchPrior ? 'Clean ball touch' : 'No prior ball contact'}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Ruling & IFAB Rationale */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] font-mono">
              3. IFAB Law 12 Regulatory Rationale
            </h4>
            <div className="p-3.5 bg-neutral-900/60 rounded-lg border border-neutral-800 space-y-2 leading-relaxed">
              <div className="font-mono text-amber-400 font-semibold">{result.lawCitation}</div>
              <p className="text-neutral-300">{result.officialRationale}</p>
            </div>
          </div>

          {/* Official Communications Log */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] font-mono">
              4. Headset Intercom Audio Transcript
            </h4>
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-emerald-400/90 italic">
              "{result.refereeIntercomAudioScript}"
            </div>
          </div>

          {/* Synced Firestore Reviews History */}
          {savedReviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] font-mono">
                5. Persisted Cloud Reviews ({savedReviews.length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {savedReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-2 rounded bg-neutral-900/50 border border-neutral-800 text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-neutral-200">{rev.refereeAction}</span>
                      <span className="text-neutral-400">· {rev.recommendedDecision}</span>
                    </div>
                    <span className="text-neutral-500 text-[10px]">{rev.userEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <span className="text-[11px] font-mono text-neutral-500">
            Validated by AI Video Operations Room · Firebase Cloud Sync Enabled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
