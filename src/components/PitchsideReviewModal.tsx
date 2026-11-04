import React, { useState } from 'react';
import { MatchIncident } from '../types/var';
import { X, Check, AlertCircle, MonitorPlay, ShieldAlert } from 'lucide-react';

interface PitchsideReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: MatchIncident;
  onConfirmRefereeDecision: (decision: string) => void;
}

export const PitchsideReviewModal: React.FC<PitchsideReviewModalProps> = ({
  isOpen,
  onClose,
  incident,
  onConfirmRefereeDecision,
}) => {
  const [selectedVerdict, setSelectedVerdict] = useState<string>('RED_CARD_SERIOUS_FOUL_PLAY');
  const [refereeNotes, setRefereeNotes] = useState<string>(
    'Confirmed high contact with studs directly on mid-shin. Excessive force used with straight leg endangering player safety.'
  );

  if (!isOpen) return null;

  const handleApplyDecision = () => {
    onConfirmRefereeDecision(selectedVerdict);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <MonitorPlay className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Pitchside Referee Review Monitor (OFR Station)
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {incident.matchFixture} · Sideline Monitor Feed
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Angles & Referee Decision Engine */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Dual Camera Monitor Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black">
              <img
                src={incident.cameraFeeds.telephoto_contact.poster}
                alt="Telephoto Contact"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-neutral-950/80 font-mono text-[10px] text-amber-400 border border-neutral-800">
                CAM 2 · CONTACT POINT (0.25x SLOW-MO)
              </div>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black">
              <img
                src={incident.cameraFeeds.broadcast_wide.poster}
                alt="Broadcast Wide"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-neutral-950/80 font-mono text-[10px] text-blue-400 border border-neutral-800">
                CAM 1 · BROADCAST SPEED & CONTEXT (1.0x)
              </div>
            </div>
          </div>

          {/* Incident Context */}
          <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Initial On-Field Call:</span>
              <span className="font-mono text-neutral-400">{incident.initialOnFieldCall}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">VAR Recommendation:</span>
              <span className="font-mono text-rose-400 font-bold">
                {incident.defaultAiVerdict.decisionLabel}
              </span>
            </div>
          </div>

          {/* Referee Final Ruling Selection */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-300 block">
              Match Referee Final Ruling (Law 5 Discretion)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'RED_CARD_SERIOUS_FOUL_PLAY',
                  label: 'Overturn: Direct Red Card',
                  sub: 'Serious Foul Play (Law 12.3)',
                  color: 'border-red-600/50 bg-red-950/30 text-red-200',
                },
                {
                  id: 'YELLOW_CARD_RECKLESS',
                  label: 'Overturn: Caution (Yellow Card)',
                  sub: 'Reckless Challenge (Law 12.1)',
                  color: 'border-amber-600/50 bg-amber-950/30 text-amber-200',
                },
                {
                  id: 'PENALTY_AWARDED',
                  label: 'Overturn: Award Penalty Kick',
                  sub: 'Careless Trip in Penalty Box',
                  color: 'border-blue-600/50 bg-blue-950/30 text-blue-200',
                },
                {
                  id: 'NO_FOUL_PLAY_ON',
                  label: 'Confirm Original Call: Play On',
                  sub: 'No Clear & Obvious Error',
                  color: 'border-emerald-600/50 bg-emerald-950/30 text-emerald-200',
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedVerdict(opt.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedVerdict === opt.id
                      ? `${opt.color} ring-2 ring-blue-500 shadow-md`
                      : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-sm font-bold text-neutral-100">{opt.label}</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Official Referee Whistle Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 block">
              Official Match Referee Match Report Justification
            </label>
            <textarea
              rows={2}
              value={refereeNotes}
              onChange={e => setRefereeNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel Review
          </button>
          <button
            onClick={handleApplyDecision}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Signal Pitch Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
