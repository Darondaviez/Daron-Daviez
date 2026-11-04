import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

export const LawGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-neutral-300 font-sans text-xs">
      <div className="pb-3 border-b border-neutral-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>IFAB Law 12 & VAR Protocol Reference Architecture</span>
        </h2>
        <p className="text-neutral-400 mt-1">
          The legal rules and thresholds executed by the VAR Apex AI Engine.
        </p>
      </div>

      {/* Law 12: Fouls & Misconduct */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Careless */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Careless Challenge</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400">DISCIPLINARY: NO CARD</div>
          <p className="leading-relaxed text-neutral-300">
            Player shows lack of attention or consideration when making a challenge, or acts without precaution. No disciplinary sanction is needed; restart with a Direct Free Kick.
          </p>
        </div>

        {/* Reckless */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-amber-800/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Reckless Challenge</span>
          </div>
          <div className="text-[11px] font-mono text-amber-300">DISCIPLINARY: YELLOW CARD</div>
          <p className="leading-relaxed text-neutral-300">
            Player acts with disregard to the danger to, or consequences for, an opponent. Must be cautioned (Yellow Card). Often characterized by late tackles with moderate speed or flailing arms.
          </p>
        </div>

        {/* Serious Foul Play */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-rose-800/60 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-4 h-4" />
            <span>Serious Foul Play (SFP)</span>
          </div>
          <div className="text-[11px] font-mono text-rose-300">DISCIPLINARY: DIRECT RED CARD</div>
          <p className="leading-relaxed text-neutral-300">
            A tackle or challenge that endangers the safety of an opponent or uses excessive force or brutality. Any player who lunges at an opponent in challenging for the ball from the front, side, or behind using one or both legs with excessive force or endangering safety.
          </p>
        </div>
      </div>

      {/* DOGSO 4 Pillars */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <h3 className="font-bold text-neutral-100 text-sm">
          DOGSO: Denial of an Obvious Goal-Scoring Opportunity
        </h3>
        <p className="text-neutral-400">
          The following four criteria must all be considered by the AI tracking engine:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
          <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
            <span className="text-amber-400 font-bold block">1. Distance to Goal</span>
            <span>Closer proximity exponentially elevates obviousness threshold.</span>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
            <span className="text-amber-400 font-bold block">2. General Direction of Play</span>
            <span>Attacker momentum moving directly towards goal line vs heading away to touchline.</span>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
            <span className="text-amber-400 font-bold block">3. Ball Control Likelihood</span>
            <span>Likelihood of keeping or gaining control of the ball.</span>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
            <span className="text-amber-400 font-bold block">4. Number & Location of Defenders</span>
            <span>Whether another defender could challenge or intercept cleanly.</span>
          </div>
        </div>
      </div>

      {/* VAR Operating Protocol */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
        <h3 className="font-bold text-neutral-100 text-sm">
          VAR Four Reviewable Categories
        </h3>
        <ul className="list-disc list-inside space-y-1 text-neutral-300 text-xs leading-relaxed">
          <li><strong>Goal / No Goal:</strong> Attacking phase foul, offside leading to goal, ball out of play.</li>
          <li><strong>Penalty / No Penalty:</strong> Fouls inside penalty area, diving/simulation, ball awarded erroneously.</li>
          <li><strong>Direct Red Card:</strong> Serious foul play, violent conduct, biting, spitting, offensive language.</li>
          <li><strong>Mistaken Identity:</strong> Referee cautions or sends off the wrong player.</li>
        </ul>
      </div>
    </div>
  );
};
