"use client";

import React, { useState } from 'react';
import { AppWindow, Heart, MessageSquare, Bookmark, ArrowLeft, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { SugoraApp } from '../types';

interface AppsWebViewProps {
  apps: SugoraApp[];
}

export default function AppsWebView({ apps }: AppsWebViewProps) {
  const [selectedApp, setSelectedApp] = useState<SugoraApp | null>(null);
  const [isLoadingFrame, setIsLoadingFrame] = useState<boolean>(true);

  const handleOpenApp = (app: SugoraApp) => {
    setSelectedApp(app);
    setIsLoadingFrame(true);
  };

  const handleCloseApp = () => {
    setSelectedApp(null);
  };

  return (
    <div id="apps-webview-wrapper" className="space-y-6">
      {!selectedApp ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <AppWindow className="h-6 w-6 text-emerald-600" />
              Embedded Apps Hub
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Admin-managed directories. All portals execute securely inside Sugora. No external navigations.
            </p>
          </div>

          {/* Directory Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="group p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-4">
                    {app.name[0]}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">{app.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/10">
                  <button
                    onClick={() => handleOpenApp(app)}
                    className="w-full rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 py-2.5 transition active:scale-95"
                  >
                    Launch in Sugora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ACTIVE EMBEDDED IN-APP VIEWPORT COMPARTMENT */
        <div className="flex flex-col h-[640px] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/60 shadow-xl">
          {/* Custom simulated browser head toolbar */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseApp}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-200">{selectedApp.name} Browser Viewport</span>
            </div>

            {/* Simulated SSL Bar address locator */}
            <div className="hidden sm:flex-1 max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl px-3 py-1.5 border border-gray-100 dark:border-zinc-800 flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="truncate">https://sugora.com/secure_sandbox/{selectedApp.id}</span>
            </div>

            <button onClick={() => {
              setIsLoadingFrame(true);
              setTimeout(() => setIsLoadingFrame(false), 800);
            }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 relative bg-gray-50 p-2 overflow-y-auto font-sans">
            {isLoadingFrame && (
              <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                <span className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs font-semibold text-gray-500 mt-2 font-mono">Initializing Sandboxed Webview...</span>
              </div>
            )}

            {/* Split rendering strategy: Youtube and embed friendly urls use iframe, others fallback to responsive mock layout */}
            {selectedApp.id === 'app-youtube' ? (
              <iframe
                src={selectedApp.url}
                className="w-full h-full rounded-xl border-none bg-black"
                title="Embedded Youtube View"
                onLoad={() => setIsLoadingFrame(false)}
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : selectedApp.id === 'app-instagram' ? (
              <iframe
                src={selectedApp.url}
                className="w-full h-full rounded-xl border-none bg-zinc-50"
                title="Embedded Instagram Post View"
                onLoad={() => setIsLoadingFrame(false)}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              /* COMPREHENSIVE LUXURY FALLBACK STATIC PORTAL SIMULATORS */
              <div id="fallback-micro-social-app" className="h-full rounded-xl overflow-y-auto bg-zinc-950 text-white p-4 max-w-md mx-auto shadow-inner space-y-4">
                {selectedApp.id === 'app-instagram' || selectedApp.id === 'app-x' ? (
                  /* Instagram/X layout posts simulator */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600" />
                        <div>
                          <span className="text-xs font-bold block">@sugorabuilder</span>
                          <span className="text-[9px] text-zinc-500 font-mono">Powered by Embedded Simulator</span>
                        </div>
                      </div>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-300">Instagram Web</span>
                    </div>

                    <div className="bg-zinc-900 rounded-xl overflow-hidden">
                      <img
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"
                        alt="Figma layout"
                        onLoad={() => setIsLoadingFrame(false)}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex gap-3 text-zinc-400">
                          <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500 hover:scale-125 transition" />
                          <MessageSquare className="h-4.5 w-4.5" />
                          <Bookmark className="h-4.5 w-4.5" />
                        </div>
                        <p className="font-semibold text-[10px]">1,240 likes</p>
                        <p className="text-zinc-300">
                          <span className="font-bold mr-1">sugorabuilder</span> Testing our embed sandboxes today! Everything operates super smoothly.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard universal Facebook / Web redirect placeholder view */
                  <div className="p-5 text-center flex flex-col justify-center items-center h-full">
                    <Sparkles className="h-10 w-10 text-teal-400 mb-2 animate-bounce" onLoad={() => setIsLoadingFrame(false)} />
                    <h3 className="font-bold text-sm text-zinc-200">Sandboxed Application Hub</h3>
                    <p className="text-[11px] text-zinc-400 mt-2 max-w-xs leading-relaxed font-sans">
                      This app is fully sandbox protected inside Sugora page! Click on other embedded items (like local YouTube guides) to see active media streams.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
