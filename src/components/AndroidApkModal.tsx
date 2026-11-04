import React, { useState } from 'react';
import { Smartphone, Download, Terminal, Check, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "VAR Apex" com.varapex.referee --web-dir dist
npm run build
npx cap add android
npx cap open android`;

  const gradleBuildCommand = `cd android && ./gradlew assembleDebug
# Output APK generated at:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest=https://${window.location.host}/manifest.webmanifest
npx @bubblewrap/cli build`;

  const handleDownloadManifest = () => {
    const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.varapex.referee">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="VAR Apex"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="VAR Apex"
            android:screenOrientation="sensorLandscape"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const blob = new Blob([manifestContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AndroidManifest.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Android APK & WebAPK Deployment
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                VAR Apex Mobile & Tablet Referee Installation
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-300">
          {/* Method 1: Instant Direct Android WebAPK Install */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-emerald-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  Method 1 · Recommended for Android Devices
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Direct Android WebAPK Installation
                </h4>
                <p className="text-neutral-400 text-xs mt-1">
                  Android Chrome and Chromium browsers compile and package compliant PWAs directly into native Android APKs installed on your home screen and app launcher.
                </p>
              </div>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {isInstallable ? (
                <button
                  onClick={install}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Native Android APK Now</span>
                </button>
              ) : isInstalled ? (
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Already Installed as Android Native App</span>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950 p-2.5 rounded border border-neutral-800 w-full">
                  💡 On an Android phone or tablet: Open in Chrome/Edge & tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong> to generate the native WebAPK package.
                </div>
              )}
            </div>
          </div>

          {/* Method 2: Standalone .APK Build via Capacitor */}
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                  Method 2 · Standalone Sideloadable APK (.apk)
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Build Standalone Android APK with Capacitor
                </h4>
              </div>
              <button
                onClick={handleDownloadManifest}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>AndroidManifest.xml</span>
              </button>
            </div>

            <p className="text-neutral-400 text-xs">
              Turn this project into a native Android Studio project and compile your signed release APK with full camera/microphone referee permissions:
            </p>

            {/* Code Block 1 */}
            <div className="relative p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
              <pre className="overflow-x-auto">{capacitorCommands}</pre>
              <button
                onClick={() => handleCopy(capacitorCommands, 1)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                title="Copy commands"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400">
              To compile <code className="text-neutral-200 font-mono">app-debug.apk</code> directly from the command line without opening Android Studio:
            </p>

            {/* Code Block 2 */}
            <div className="relative p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
              <pre className="overflow-x-auto">{gradleBuildCommand}</pre>
              <button
                onClick={() => handleCopy(gradleBuildCommand, 2)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                title="Copy commands"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Method 3: Google Play Store TWA (Bubblewrap) */}
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
              Method 3 · Google Play Store (TWA)
            </span>
            <h4 className="text-sm font-bold text-white">
              Package via Google Bubblewrap CLI
            </h4>
            <div className="relative p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
              <pre className="overflow-x-auto">{bubblewrapCommand}</pre>
              <button
                onClick={() => handleCopy(bubblewrapCommand, 3)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                title="Copy commands"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <span className="text-[11px] font-mono text-neutral-500">
            Complies with Android 14+ Edge-to-Edge & W3C Web Manifest Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
