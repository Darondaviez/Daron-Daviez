import React from 'react';
import { Upload, Smartphone, UserCheck, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onOpenApkModal: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenUpload,
  onOpenReport,
  onOpenApkModal,
  currentUser,
  onLogin,
  onLogout,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="/"
        onClick={e => {
          e.preventDefault();
          onSelectTab('workstation');
        }}
        className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-sans"
      >
        VAR Apex
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onSelectTab('workstation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'workstation' ? 'text-white font-semibold' : ''
          }`}
        >
          Workstation
        </button>
        <button
          onClick={() => onSelectTab('multicam')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'multicam' ? 'text-white font-semibold' : ''
          }`}
        >
          Multi-Camera
        </button>
        <button
          onClick={() => onSelectTab('radar')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'radar' ? 'text-white font-semibold' : ''
          }`}
        >
          Tactical Radar
        </button>
        <button
          onClick={() => onSelectTab('laws')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'laws' ? 'text-white font-semibold' : ''
          }`}
        >
          Law 12 Guide
        </button>
        <button
          onClick={onOpenReport}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Incident Dossier
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Install as Android APK or WebAPK"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install APK</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Load Clip</span>
        </button>

        {/* Referee Firebase Auth */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1 border-l border-neutral-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[100px]">{currentUser.displayName || 'Referee'}</span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
