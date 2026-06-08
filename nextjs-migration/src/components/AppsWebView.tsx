/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AppWindow, Heart, Star, Share2, Youtube, ExternalLink, ArrowLeft, 
  RefreshCw, Send, ShieldCheck, Sparkles, Search, Play, HelpCircle 
} from 'lucide-react';
import { SugoraApp } from '../types';

interface AppsWebViewProps {
  apps: SugoraApp[];
}

interface AppStats {
  rating: number;
  launches: number;
  category: 'Social' | 'Productivity' | 'Media' | 'Utilities';
}

const DEFAULT_APP_STATS: Record<string, AppStats> = {
  'app-instagram': { rating: 4.8, launches: 1420, category: 'Social' },
  'app-youtube': { rating: 4.9, launches: 2855, category: 'Media' },
  'app-facebook': { rating: 4.4, launches: 840, category: 'Social' },
  'app-telegram': { rating: 4.7, launches: 1950, category: 'Productivity' },
  'app-x': { rating: 4.5, launches: 1100, category: 'Utilities' }
};

export default function AppsWebView({ apps }: AppsWebViewProps) {
  const [selectedApp, setSelectedApp] = useState<SugoraApp | null>(null);
  const [isLoadingFrame, setIsLoadingFrame] = useState<boolean>(true);

  // Search & Categories state
  const categories = ['All', 'Social', 'Productivity', 'Media', 'Utilities'];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Likes tracking
  const [lovedAppIds, setLovedAppIds] = useState<string[]>(['app-youtube']);

  const handleOpenApp = (app: SugoraApp) => {
    setSelectedApp(app);
    setIsLoadingFrame(true);
  };

  const handleCloseApp = () => {
    setSelectedApp(null);
  };

  const toggleLoveApp = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLovedAppIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  // Filter app items
  const filteredApps = apps.filter(app => {
    const stats = DEFAULT_APP_STATS[app.id] || { rating: 4.5, launches: 400, category: 'Utilities' };
    const matchesCategory = selectedCategory === 'All' || stats.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="apps-hub-container" className="space-y-6 bg-slate-50/20 dark:bg-zinc-950/20 p-1 md:p-4 rounded-3xl font-sans">
      {!selectedApp ? (
        <>
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm">
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <AppWindow className="h-6.5 w-6.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                Embedded Apps Sandbox
              </h1>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                Execute external creators, tools, or widgets directly inside Sugora. No redirects, no leakage profiles.
              </p>
            </div>

            {/* Controls */}
            <div className="relative max-w-xs w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search embedded directories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 focus:bg-white border border-slate-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-150 font-sans font-medium"
              />
            </div>
          </div>

          {/* Categories Pill row */}
          <div className="flex flex-wrap gap-2 px-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer select-none transition duration-150 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border-slate-205 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Apps Layout Showcase Grid */}
          {filteredApps.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 p-12 text-center text-slate-450 dark:text-zinc-550 font-bold font-sans">
              No sandboxed applications of that metric found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => {
                const stats = DEFAULT_APP_STATS[app.id] || { rating: 4.5, launches: 350, category: 'Utilities' };
                const isLoved = lovedAppIds.includes(app.id);

                return (
                  <div
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    className="group bg-white dark:bg-zinc-900 rounded-3xl border border-slate-105 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer relative text-left"
                  >
                    <div>
                      {/* Logo & Love Icon header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-sm border border-blue-100 dark:border-blue-900/40">
                          {app.name[0]}
                        </div>

                        <button
                          key={`love-${app.id}`}
                          type="button"
                          onClick={(e) => toggleLoveApp(app.id, e)}
                          className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-400 dark:text-zinc-500 hover:text-rose-500 flex items-center justify-center border dark:border-zinc-800 cursor-pointer"
                        >
                          <Heart className={`h-4.5 w-4.5 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Title & Stats */}
                      <div className="space-y-1.5 pt-1 font-sans">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-540">
                            {stats.rating} • {stats.launches} secure launches
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 dark:text-zinc-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-[11.5px] text-slate-455 dark:text-zinc-400 leading-relaxed block font-medium">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-zinc-850 flex items-center justify-between font-sans">
                      <span className="rounded-lg bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 px-2 py-0.5 text-[9px] font-extrabold uppercase text-slate-550 dark:text-zinc-400">
                        {stats.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        className="rounded-xl bg-blue-50 dark:bg-blue-950/20 group-hover:bg-blue-600 group-hover:text-white text-blue-700 dark:text-blue-400 font-extrabold text-[11px] px-3.5 py-2 flex items-center gap-1 transition border-0 cursor-pointer"
                      >
                        Launch
                        <Play className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ACTIVE SANDBOX TERMINAL WINDOW */
        <div className="flex flex-col h-[650px] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-105 dark:border-zinc-800 shadow-xl font-sans">
          {/* Simulated head browser toolbar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseApp}
                className="rounded-xl h-8 w-8 bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-850 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div className="text-left font-sans">
                <span className="text-xs font-black text-slate-900 dark:text-zinc-150 block leading-tight">{selectedApp.name} Simulator</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Executing securely inside sandboxed profile</span>
              </div>
            </div>

            {/* Simulated SSL locator */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4 bg-white dark:bg-zinc-950 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-zinc-800 flex-row items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500 shadow-inner">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">https://sugora.secure.sandbox/port_3000/{selectedApp.id}</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                setIsLoadingFrame(true);
                setTimeout(() => setIsLoadingFrame(false), 900);
              }} 
              className="h-8.5 w-8.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border dark:border-zinc-800 flex items-center justify-center text-slate-450 dark:text-zinc-500 transition cursor-pointer"
              title="Refresh frame sandbox key cache"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 relative bg-slate-100 dark:bg-zinc-950 p-2 overflow-y-auto">
            {isLoadingFrame && (
              <div className="absolute inset-0 bg-white dark:bg-zinc-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-center z-10 font-sans">
                <span className="source-loader h-8 w-8 border-3 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-440 mt-3 font-mono animate-pulse">Initializing Sandboxed Webview Container...</span>
              </div>
            )}

            {selectedApp.id === 'app-youtube' ? (
              <iframe
                src={selectedApp.url}
                className="w-full h-full rounded-2xl border-none bg-black"
                title="Embedded Youtube View"
                onLoad={() => setIsLoadingFrame(false)}
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : selectedApp.id === 'app-instagram' ? (
              <iframe
                src={selectedApp.url}
                className="w-full h-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black"
                title="Embedded Instagram"
                onLoad={() => setIsLoadingFrame(false)}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              /* LUXURY FALLBACK SANDBOX PORTAL SIMULATORS */
              <div id="fallback-sandbox-frame" className="h-full rounded-2xl overflow-y-auto bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 p-6 max-w-md mx-auto shadow-inner border dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3 font-sans">
                  <div className="flex items-center gap-2 text-left">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600" />
                    <div>
                      <span className="text-xs font-black block text-slate-800 dark:text-zinc-200">@sugorabuilder</span>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">Real-time simulation active</span>
                    </div>
                  </div>
                  <span className="rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-105 dark:border-blue-900/40 px-2 py-0.5 text-[9px] text-blue-700 dark:text-blue-400 font-bold uppercase">
                    {selectedApp.name} Active
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed block font-medium font-sans text-left">
                  This simulates standard web requests for {selectedApp.name}. You can click verification metrics or edit your credentials directly in Sugora pages!
                </p>

                <div className="p-4 bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl space-y-2 text-xs font-sans text-left">
                  <span className="font-extrabold text-slate-700 dark:text-zinc-300 block">Mock Activity metrics:</span>
                  <div className="flex justify-between font-medium">
                    <span>Active users now</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">84 creators</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Average active time</span>
                    <span className="font-mono text-slate-500 dark:text-zinc-500">12 mins / session</span>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-5 p-y-4 text-center font-sans">
                  <span className="text-xs text-slate-450 dark:text-zinc-500 block font-semibold mb-2">Request user permission inputs?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoadingFrame(true);
                      setTimeout(() => {
                        setIsLoadingFrame(false);
                        alert('Sandbox credentials aligned dynamically.');
                      }, 700);
                    }}
                    className="bg-slate-900 hover:bg-black dark:bg-zinc-950 dark:hover:bg-zinc-800 text-white rounded-xl text-xs py-2 px-4 shadow-sm border-0 cursor-pointer font-sans font-bold"
                  >
                    Grant Simulator Consent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
