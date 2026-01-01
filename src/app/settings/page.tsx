// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { storage } from "@/lib/storage";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState(() => {
    const settings = storage.getSettings();
    return settings.displayName || "";
  });

  const [captureToken, setCaptureToken] = useState(() => {
    const settings = storage.getSettings();
    return settings.captureToken || "";
  });

  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSave = () => {
    storage.saveSettings({ displayName, captureToken });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Gallery</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            Settings
          </h1>

          {/* Display Name */}
          <div className="mb-6">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
            <p className="mt-2 text-sm text-gray-500">
              Your name will appear in generated reports.
            </p>
          </div>

          {/* Capture Token */}
          <div className="mb-6">
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Numbers Protocol Capture Token
            </label>
            <div className="relative">
              <input
                id="token"
                type={showToken ? "text" : "password"}
                value={captureToken}
                onChange={(e) => setCaptureToken(e.target.value)}
                placeholder="Enter your capture token..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your capture token is required to attach ProofSnap evidence to
              annotations. You can find it in the ProofSnap extension settings.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Settings
          </button>

          {saved && (
            <p className="mt-4 text-green-600 font-medium">
              ✓ Settings saved successfully!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
