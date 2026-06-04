/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Eye, MousePointer, Wallet, Share2, Upload, Plus, Trash2, Edit2, Instagram, Youtube, Facebook, Send, Phone, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { Profile, TreeProfile, TreeLink, Product } from '../types';

interface SugoraTreeProps {
  currentUser: Profile;
  availableProducts: Product[];
}

const DEFAULT_PROFILE = (username: string): TreeProfile => ({
  id: 'tree-1',
  user_id: 'current-user',
  username: username,
  display_name: 'Alex Rivera',
  bio: 'Visual Creator & Indie Developer. Crafting responsive dashboard resources and branding systems at Sugora.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
  social_links: {
    instagram: 'https://instagram.com/alexr',
    youtube: 'https://youtube.com',
    telegram: 'https://t.me/alexr'
  },
  links: [
    { id: 'l1', title: 'Follow code guides on GitHub', url: 'https://github.com', type: 'website', clicks: 310 },
    { id: 'l2', title: 'Join our Telegram Hub', url: 'https://t.me', type: 'telegram', clicks: 195 }
  ],
  theme: 'dark_neon',
  views: 1240,
  created_at: new Date().toISOString()
});

export default function SugoraTree({ currentUser, availableProducts }: SugoraTreeProps) {
  const [treeProfile, setTreeProfile] = useState<TreeProfile>(DEFAULT_PROFILE(currentUser.username));
  const [showAddLink, setShowAddLink] = useState<boolean>(false);
  const [newLinkTitle, setNewLinkTitle] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newLinkType, setNewLinkType] = useState<TreeLink['type']>('custom');

  // Monetization items on Tree
  const [selectedProductIdsToMonetize, setSelectedProductIdsToMonetize] = useState<string[]>(['prod-1']);

  // Local analytics simulation state incrementing
  const [viewClicks, setViewClicks] = useState<number>(treeProfile.views);
  const [linkClicksTotal, setLinkClicksTotal] = useState<number>(
    treeProfile.links.reduce((acc, l) => acc + l.clicks, 0)
  );
  const [productClicksTotal, setProductClicksTotal] = useState<number>(45);

  const handleUpdateField = (field: keyof TreeProfile, val: any) => {
    setTreeProfile(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const newLink: TreeLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl,
      type: newLinkType,
      clicks: 0
    };

    setTreeProfile(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));

    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkType('custom');
    setShowAddLink(false);
  };

  const handleDeleteLink = (linkId: string) => {
    setTreeProfile(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== linkId)
    }));
  };

  const handleSimulatePhoneInteraction = (type: 'view' | 'link' | 'product', label?: string) => {
    if (type === 'view') {
      setViewClicks(prev => prev + 1);
    } else if (type === 'link') {
      setLinkClicksTotal(prev => prev + 1);
      // Increment click count for that specific link
      if (label) {
        setTreeProfile(prev => ({
          ...prev,
          links: prev.links.map(l => l.title === label ? { ...l, clicks: l.clicks + 1 } : l)
        }));
      }
    } else if (type === 'product') {
      setProductClicksTotal(prev => prev + 1);
    }
  };

  const toggleProductMonetize = (prodId: string) => {
    setSelectedProductIdsToMonetize(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  // Theme Class mappings
  const themeStyles = {
    modern: 'bg-zinc-50 text-zinc-900',
    dark_neon: 'bg-zinc-950 text-white border-zinc-800',
    pastel: 'bg-rose-50 text-rose-900',
    cyberpunk: 'bg-yellow-50 text-black border-yellow-300'
  }[treeProfile.theme] || 'bg-zinc-50';

  const phoneCardStyles = {
    modern: 'bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-100',
    dark_neon: 'bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800 border border-zinc-800/80 hover:border-emerald-500/50',
    pastel: 'bg-white text-rose-900 hover:bg-rose-100 border border-rose-100/45',
    cyberpunk: 'bg-black text-yellow-400 hover:bg-zinc-900 border-2 border-black hover:border-yellow-400'
  }[treeProfile.theme] || 'bg-white';

  return (
    <div id="sugora-tree-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: THE ACTIVE BUILDER CUSTOMIZER */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Customize Sugora Tree
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Build your personal Linktree-style microsite mapped perfectly to:
            <span className="font-mono text-emerald-600 block mt-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded w-fit text-[11px]">
              sugora.com/u/{currentUser.username}
            </span>
          </p>

          {/* Core metadata forms */}
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Display Title</label>
              <input
                type="text"
                value={treeProfile.display_name}
                onChange={(e) => handleUpdateField('display_name', e.target.value)}
                className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Profile Bio</label>
              <textarea
                value={treeProfile.bio}
                onChange={(e) => handleUpdateField('bio', e.target.value)}
                className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Profile Avatar URL</label>
                <input
                  type="text"
                  value={treeProfile.avatar_url || ''}
                  onChange={(e) => handleUpdateField('avatar_url', e.target.value)}
                  className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Cover Graphic URL</label>
                <input
                  type="text"
                  value={treeProfile.cover_url || ''}
                  onChange={(e) => handleUpdateField('cover_url', e.target.value)}
                  className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Aesthetic presets theme toggles */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Microsite Theme Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['modern', 'dark_neon', 'pastel', 'cyberpunk'].map((th) => (
                  <button
                    key={th}
                    onClick={() => handleUpdateField('theme', th)}
                    className={`rounded-xl py-3 border text-xs font-bold capitalize transition ${
                      treeProfile.theme === th
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
                        : 'border-gray-100 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                    }`}
                  >
                    {th.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic customized links listings block */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">Cards & External Redirect URLs</h3>
            <button
              onClick={() => setShowAddLink(!showAddLink)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-1.5 font-bold flex items-center gap-1 shadow-sm transition"
            >
              <Plus className="h-4 w-4" /> Add Card
            </button>
          </div>

          {showAddLink && (
            <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/60 mb-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Card title label</label>
                  <input
                    type="text"
                    placeholder="e.g. Subscribe on YouTube"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 text-xs py-2 px-2.5 border"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Destination link</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 text-xs py-2 px-2.5 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Visual Icon Type</label>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as any)}
                  className="w-full rounded bg-white dark:bg-zinc-900 text-xs p-2 border"
                >
                  <option value="custom">Standard/Custom Link</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="website">Website Portfolio</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button onClick={() => setShowAddLink(false)} className="px-3 py-2 text-gray-500">Cancel</button>
                <button onClick={handleAddLink} className="rounded bg-emerald-600 text-white font-bold px-3 py-2">Publish</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {treeProfile.links.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/20 dark:border-zinc-800/10 dark:bg-zinc-900/10 hover:border-gray-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-900 dark:text-zinc-200 block truncate">{l.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono block truncate">{l.url}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-mono font-medium">{l.clicks} clicks</span>
                  <button
                    onClick={() => handleDeleteLink(l.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization widgets connector */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm mb-2 flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-emerald-600" /> Monetization Integration
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Link digital products or affiliate materials directly onto your landing biography card. Users pay directly to Sugora.
          </p>

          <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto">
            {availableProducts.map(p => {
              const isPublished = selectedProductIdsToMonetize.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProductMonetize(p.id)}
                  className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition ${
                    isPublished
                      ? 'border-emerald-500/80 bg-emerald-50/25 dark:bg-emerald-950/20'
                      : 'border-gray-50 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded" />
                    <div>
                      <span className="block text-xs font-bold truncate text-gray-900 dark:text-zinc-200">{p.name}</span>
                      <span className="block text-[10px] text-gray-400 capitalize">{p.type.replace('_', ' ')} • ₹{p.price}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPublished ? 'Active' : 'Add Link'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE MOCK PHONE VIEWPORT & LIVE ANALYTICS */}
      <div className="lg:col-span-5 flex flex-col items-center">
        {/* Real-time Analytics Dashboard banner */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 shadow-sm mb-6 flex items-center justify-between">
          <div className="text-center flex-1 border-r border-gray-50 dark:border-zinc-800">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Total Views</span>
            <span className="text-lg font-bold font-mono text-emerald-600">{viewClicks}</span>
          </div>
          <div className="text-center flex-1 border-r border-gray-50 dark:border-zinc-800">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Link Clicks</span>
            <span className="text-lg font-bold font-mono text-indigo-600">{linkClicksTotal}</span>
          </div>
          <div className="text-center flex-1">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Sales conversion</span>
            <span className="text-lg font-bold font-mono text-amber-600">{productClicksTotal}</span>
          </div>
        </div>

        {/* Simulated Mobile Device container frame */}
        <div className="w-full max-w-[285px] h-[550px] bg-zinc-900 rounded-[38px] p-3.5 shadow-2xl relative border-[4px] border-zinc-800 ring-6 ring-zinc-950/20">
          {/* Simulated phone Notch / speaker element */}
          <div className="absolute top-0 inset-x-0 flex justify-center z-10">
            <div className="h-4.5 w-28 bg-zinc-900 rounded-b-xl flex items-center justify-around px-2 text-[8px] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-white/15"></span>
              <span>sugora.com</span>
            </div>
          </div>

          <div
            onClick={() => handleSimulatePhoneInteraction('view')}
            className={`w-full h-full rounded-[26px] overflow-y-auto px-4 py-8 relative shadow-inner flex flex-col justify-between scrollbar-none ${themeStyles} selection:bg-teal-500/10`}
          >
            {/* Biography header */}
            <div className="text-center mt-4">
              <div className="relative inline-block">
                <img
                  referrerPolicy="no-referrer"
                  src={treeProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={treeProfile.display_name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500/80 mx-auto"
                />
              </div>
              <h1 className="mt-2 text-sm font-bold tracking-tight">{treeProfile.display_name}</h1>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">@/{currentUser.username}</p>
              
              <p className="mt-2 text-[11px] text-gray-500 leading-normal max-w-[210px] mx-auto truncate-multiline">
                {treeProfile.bio}
              </p>
            </div>

            {/* Social Connect Link vectors */}
            <div className="flex justify-center gap-3.5 my-4">
              {treeProfile.social_links.instagram && (
                <button onClick={() => handleSimulatePhoneInteraction('link')} className="opacity-80 hover:scale-125 transition">
                  <Instagram className="h-4.5 w-4.5" />
                </button>
              )}
              {treeProfile.social_links.youtube && (
                <button onClick={() => handleSimulatePhoneInteraction('link')} className="opacity-80 hover:scale-125 transition">
                  <Youtube className="h-4.5 w-4.5" />
                </button>
              )}
              {treeProfile.social_links.telegram && (
                <button onClick={() => handleSimulatePhoneInteraction('link')} className="opacity-80 hover:scale-125 transition">
                  <Send className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {/* Main widgets links sequence */}
            <div className="space-y-2 flex-grow mt-2">
              {treeProfile.links.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleSimulatePhoneInteraction('link', l.title)}
                  className={`w-full px-4 py-2.5 rounded-xl text-center font-semibold text-xs transition duration-200 active:scale-95 flex items-center justify-between ${phoneCardStyles}`}
                >
                  <div className="mr-4">
                    {l.type === 'instagram' && <Instagram className="h-3.5 w-3.5 opacity-70" />}
                    {l.type === 'youtube' && <Youtube className="h-3.5 w-3.5 opacity-70" />}
                    {l.type === 'telegram' && <Send className="h-3.5 w-3.5 opacity-70" />}
                    {l.type === 'whatsapp' && <Phone className="h-3.5 w-3.5 opacity-70" />}
                    {l.type === 'website' && <Globe className="h-3.5 w-3.5 opacity-70" />}
                  </div>
                  <span className="truncate flex-1 text-center">{l.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-40 ml-1" />
                </button>
              ))}

              {/* Showcase the added e-commerce digital downloads on Tree */}
              {selectedProductIdsToMonetize.map(id => {
                const prod = availableProducts.find(ap => ap.id === id);
                if (!prod) return null;
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSimulatePhoneInteraction('product')}
                    className={`w-full p-2.5 rounded-xl text-left transition text-xs flex items-center justify-between ${phoneCardStyles}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img referrerPolicy="no-referrer" src={prod.image_url} alt={prod.name} className="h-9 w-9 object-cover rounded" />
                      <div className="min-w-0">
                        <span className="block font-bold text-[10px] truncate">{prod.name}</span>
                        <span className="block text-[9px] text-emerald-500 font-bold">₹{prod.price}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-1 rounded-md shrink-0">
                      Get PDF
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Platform footer */}
            <div className="text-center text-[8px] tracking-wider uppercase font-bold text-gray-400 border-t pt-2 mt-4 opacity-50">
              Powered by Sugora Tree
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
