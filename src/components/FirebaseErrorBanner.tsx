import React from 'react';
import { AlertTriangle, KeyRound } from 'lucide-react';
import { getFirebaseConfig } from '../firebase';

export const FirebaseErrorBanner: React.FC = () => {
  const { isValid, missingKeys } = getFirebaseConfig();

  if (isValid) {
    return null;
  }

  return (
    <div
      id="firebase-config-missing-banner"
      className="min-h-screen w-full bg-[#FCF8F9] flex items-center justify-center p-6 text-stone-800 font-sans"
    >
      <div className="max-w-md w-full bg-white border border-amber-300 rounded-3xl p-8 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            Firebase Configuration Missing
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            The application requires active Firebase Authentication and Cloud Firestore settings to store your journal safely.
          </p>
        </div>

        {missingKeys.length > 0 && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-xs font-mono text-amber-900 space-y-1">
            <p className="font-sans font-semibold text-amber-950 flex items-center gap-1.5 mb-1">
              <KeyRound className="w-3.5 h-3.5" /> Missing fields:
            </p>
            {missingKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{key}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-stone-500 leading-relaxed">
          Please verify your <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">firebase-applet-config.json</code> configuration to connect to your project.
        </div>
      </div>
    </div>
  );
};
