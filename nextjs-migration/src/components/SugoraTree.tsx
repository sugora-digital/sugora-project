/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Eye, MousePointer, Share2, Plus, Trash2, Edit2, 
  Instagram, Youtube, Facebook, Send, Phone, Globe, ExternalLink, 
  RefreshCw, Check, AppWindow, ShoppingBag, ShieldCheck, Mail, MapPin 
} from 'lucide-react';
import { Profile, TreeProfile, TreeLink, Product } from '../types';

interface SugoraTreeProps {
  currentUser: Profile;
  availableProducts: Product[];
}

const DEFAULT_TREE = (username: string): TreeProfile => ({
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
  theme: 'modern_minimalist',
  views: 1240,
  created_at: new Date().toISOString()
});

export default function SugoraTree({ currentUser, availableProducts }: SugoraTreeProps) {
  const [treeProfile, setTreeProfile] = useState<TreeProfile>(DEFAULT_TREE(currentUser.username));
  const [showAddLink, setShowAddLink] = useState<boolean>(false);
  const [newLinkTitle, setNewLinkTitle] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newLinkType, setNewLinkType] = useState<TreeLink['type']>('custom');

  // Contact info
  const [phoneContact, setPhoneContact] = useState<string>('+91 98765 43210');
  const [whatsappContact, setWhatsappContact] = useState<string>('+91 98765 43210');
  const [emailContact, setEmailContact] = useState<string>('hello@sugora.com');
  const [locationCountry, setLocationCountry] = useState<string>('India');
  const [locationRegion, setLocationRegion] = useState<string>('Maharashtra');

  // Monetization items on Tree
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-1', 'prod-2']);

  // Analytics
  const [viewClicks, setViewClicks] = useState<number>(treeProfile.views);
  const [linkClicksTotal, setLinkClicksTotal] = useState<number>(
    treeProfile.links.reduce((acc, l) => acc + l.clicks, 0)
  );

  const handleUpdateField = (field: keyof TreeProfile, val: any) => {
    setTreeProfile(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleUpdateSocial = (socialKey: string, val: string) => {
    setTreeProfile(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [socialKey]: val
      }
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

  const handleSimulateAnalytics = (type: 'view' | 'link' | 'product', label?: string) => {
    if (type === 'view') {
      setViewClicks(prev => prev + 1);
    } else if (type === 'link') {
      setLinkClicksTotal(prev => prev + 1);
      if (label) {
        setTreeProfile(prev => ({
          ...prev,
          links: prev.links.map(l => l.title === label ? { ...l, clicks: l.clicks + 1 } : l)
        }));
      }
    }
  };

  const toggleProductMonetize = (prodId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  // Color presetting combinations for actual Phone Viewport background
  const themePresets = {
    modern_minimalist: 'bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-slate-100 dark:border-zinc-900',
    sky_gradient: 'bg-gradient-to-tr from-blue-100 via-indigo-50 to-pink-100 dark:from-zinc-90 w-full dark:to-zinc-950 text-slate-900 dark:text-zinc-105 border-indigo-200/50 dark:border-zinc-900/50',
    sunset_amber: 'bg-gradient-to-tr from-orange-50 via-amber-50 to-yellow-105 dark:from-zinc-950 dark:to-zinc-900 text-amber-950 dark:text-zinc-100 border-amber-200/50 dark:border-zinc-800/50',
    emerald_forest: 'bg-gradient-to-tr from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-95 w-full dark:to-zinc-950 text-emerald-955 dark:text-zinc-105 border-emerald-200/50 dark:border-zinc-900/50',
    rose_pastel: 'bg-gradient-to-tr from-pink-50 via-rose-50 to-purple-100 dark:from-zinc-90 w-full dark:to-zinc-950 text-rose-955 dark:text-zinc-105 border-rose-200/50 dark:border-zinc-900/50'
  };

  const phoneCardStyles = {
    modern_minimalist: 'bg-white dark:bg-zinc-900 hover:bg-slate-100/80 dark:hover:bg-zinc-850 border text-slate-800 dark:text-zinc-200 border-slate-200/60 dark:border-zinc-800/80',
    sky_gradient: 'bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 border text-indigo-950 dark:text-zinc-100 border-indigo-150 dark:border-zinc-800',
    sunset_amber: 'bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-900 border text-amber-950 dark:text-zinc-100 border-amber-200/50 dark:border-zinc-800',
    emerald_forest: 'bg-white/90 dark:bg-zinc-905/90 hover:bg-white dark:hover:bg-zinc-900 border text-emerald-950 dark:text-zinc-100 border-emerald-200/50 dark:border-zinc-800',
    rose_pastel: 'bg-white/90 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-900 border text-rose-955 dark:text-zinc-100 border-rose-150 dark:border-zinc-800'
  };

  const activeThemeClass = themePresets[treeProfile.theme as keyof typeof themePresets] || themePresets.modern_minimalist;
  const activePhoneCardClass = phoneCardStyles[treeProfile.theme as keyof typeof phoneCardStyles] || phoneCardStyles.modern_minimalist;

  return (
    <div id="tree-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/20 dark:bg-zinc-955/20 p-1 md:p-4 rounded-3xl font-sans">
      
      {/* LEFT COLUMN: ACTIVE BUILDER PANEL */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-105 dark:border-zinc-800 p-5 shadow-sm text-left font-sans">
          <h2 className="text-lg font-black text-slate-900 dark:text-zinc-150 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Sugora Tree System Setup
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
            Configure display parameters, contact metadata, social anchors, and monetize your digital store items immediately.
          </p>

          <div className="mt-5 space-y-4 font-sans font-medium">
            {/* Profile identity details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Display Title</label>
                <input
                  type="text"
                  value={treeProfile.display_name}
                  onChange={(e) => handleUpdateField('display_name', e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-zinc-200 font-sans"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Profile avatar image</label>
                <input
                  type="text"
                  value={treeProfile.avatar_url}
                  onChange={(e) => handleUpdateField('avatar_url', e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs font-mono outline-none text-slate-800 dark:text-zinc-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Welcome Bio</label>
              <textarea
                value={treeProfile.bio}
                onChange={(e) => handleUpdateField('bio', e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs h-16 resize-none outline-none text-slate-800 dark:text-zinc-200 leading-relaxed font-sans font-medium"
                placeholder="Insert brief bio details..."
              />
            </div>

            {/* Geographical Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-505 uppercase tracking-widest mb-1.5">Country</label>
                <input
                  type="text"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs outline-none text-slate-805 dark:text-zinc-200 font-sans"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-505 uppercase tracking-widest mb-1.5">State / Region</label>
                <input
                  type="text"
                  value={locationRegion}
                  onChange={(e) => setLocationRegion(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs outline-none text-slate-805 dark:text-zinc-200 font-sans"
                />
              </div>
            </div>

            {/* Contact Information block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-505 uppercase tracking-widest mb-1.5">Direct Phone</label>
                <input
                  type="text"
                  value={phoneContact}
                  onChange={(e) => setPhoneContact(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs outline-none text-slate-850 dark:text-zinc-200 font-sans"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-550 uppercase tracking-widest mb-1.5">WhatsApp Chat</label>
                <input
                  type="text"
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs outline-none text-slate-850 dark:text-zinc-200 font-sans"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-550 uppercase tracking-widest mb-1.5">Business Email</label>
                <input
                  type="text"
                  value={emailContact}
                  onChange={(e) => setEmailContact(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-xs outline-none text-slate-850 dark:text-zinc-200 font-sans"
                />
              </div>
            </div>

            {/* Theme design chooser */}
            <div>
              <label className="block text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Preset Aesthetic Theme</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'modern_minimalist', name: 'Minimalist' },
                  { key: 'sky_gradient', name: 'Sky Gradient' },
                  { key: 'sunset_amber', name: 'Sunset Amber' },
                  { key: 'emerald_forest', name: 'Emerald Forest' },
                  { key: 'rose_pastel', name: 'Rose Pastel' }
                ].map(th => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => handleUpdateField('theme', th.key)}
                    className={`px-3.5 py-2.5 rounded-xl text-[10.5px] font-extrabold border cursor-pointer transition select-none ${
                      treeProfile.theme === th.key
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-750 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM BUTTON LINKS SECTION */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-105 dark:border-zinc-800 p-5 shadow-sm space-y-4 text-left font-sans">
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/20 p-2 rounded-xl">
            <h3 className="text-xs font-bold text-slate-705 dark:text-zinc-300 uppercase tracking-wider">Custom Profile Links ({treeProfile.links.length})</h3>
            <button
              type="button"
              onClick={() => setShowAddLink(!showAddLink)}
              className="rounded-lg bg-blue-600 shadow-sm text-white hover:bg-blue-700 font-extrabold text-[11px] px-3 py-1.5 flex items-center gap-1 transition border-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Appends
            </button>
          </div>

          {showAddLink && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl space-y-3.5 text-xs font-medium animate-fadeIn text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1 font-sans">Display Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subscribe to my Newsletter"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-800 focus:outline-none text-slate-808 dark:text-zinc-200 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-505 mb-1 font-sans">Anchor URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://mysubstack.com"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-800 focus:outline-none text-slate-808 dark:text-zinc-300 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center font-sans">
                <div className="flex gap-2">
                  <span className="text-[10px] text-slate-450 dark:text-zinc-500 font-bold">Protocol Icon:</span>
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as any)}
                    className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded text-[10px] px-1 font-bold focus:outline-none text-slate-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <option value="custom">Standard Link icon</option>
                    <option value="telegram">Send Telegram</option>
                    <option value="youtube">Youtube channel</option>
                    <option value="website">Custom website</option>
                  </select>
                </div>

                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setShowAddLink(false)} className="px-3 py-1.5 font-bold border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 cursor-pointer">Cancel</button>
                  <button type="button" onClick={handleAddLink} className="px-3.5 py-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer border-0">Confirm Link</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {treeProfile.links.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 transition text-xs font-semibold leading-relaxed">
                <div className="min-w-0 text-left">
                  <span className="block text-slate-800 dark:text-zinc-200 font-bold truncate">{l.title}</span>
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate">{l.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-105 dark:border-blue-900/40 select-none">
                    📈 {l.clicks} clicks
                  </span>
                  <button
                    key={`del-link-${l.id}`}
                    type="button"
                    onClick={() => handleDeleteLink(l.id)}
                    className="text-slate-400 hover:text-red-650 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOCIAL BRIDGES CHANNELS */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-105 dark:border-zinc-800 p-5 shadow-sm space-y-4 text-left font-sans">
          <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-left">Social Channels Anchor URLs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-505 mb-1.5">Instagram URL</label>
              <input
                type="text"
                value={treeProfile.social_links.instagram || ''}
                onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
                placeholder="https://instagram.com/Alex"
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-805 outline-none text-slate-805 dark:text-zinc-205 font-sans"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-505 mb-1.5">YouTube URL</label>
              <input
                type="text"
                value={treeProfile.social_links.youtube || ''}
                onChange={(e) => handleUpdateSocial('youtube', e.target.value)}
                placeholder="https://youtube.com/c/Alex"
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-805 outline-none text-slate-805 dark:text-zinc-205 font-sans"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-505 mb-1.5">Telegram URL</label>
              <input
                type="text"
                value={treeProfile.social_links.telegram || ''}
                onChange={(e) => handleUpdateSocial('telegram', e.target.value)}
                placeholder="https://t.me/Alex"
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-805 outline-none text-slate-805 dark:text-zinc-205 font-sans"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-505 mb-1.5">Facebook URL</label>
              <input
                type="text"
                value={treeProfile.social_links.facebook || ''}
                onChange={(e) => handleUpdateSocial('facebook', e.target.value)}
                placeholder="https://facebook.com/Alex"
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-805 outline-none text-slate-805 dark:text-zinc-205 font-sans"
              />
            </div>
          </div>
        </div>

        {/* CHOOSE FEATURED PRODUCTS */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-105 dark:border-zinc-800 p-5 shadow-sm space-y-4 text-left font-sans">
          <h3 className="text-xs font-bold text-slate-705 dark:text-zinc-300 uppercase tracking-wider text-left">Select Featured Store Monetizations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableProducts.map(p => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProductMonetize(p.id)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs cursor-pointer select-none ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 shadow-sm'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-205/60 dark:border-zinc-850 text-slate-505 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex gap-2.5 items-center min-w-0">
                    <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-9 w-9 object-cover rounded bg-white dark:bg-zinc-900 border dark:border-zinc-800" />
                    <div className="min-w-0 text-left font-sans">
                      <span className="block font-bold text-slate-800 dark:text-zinc-200 truncate">{p.name}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono">₹{p.price}</span>
                    </div>
                  </div>

                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700'
                  }`}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE PHONE VIEWPORT SIMULATOR */}
      <div className="lg:col-span-5 flex justify-center items-start lg:sticky lg:top-4">
        <div className="w-full max-w-[340px] rounded-[40px] bg-slate-900 border-[10px] border-slate-850 dark:border-zinc-800 p-3 shadow-2xl relative overflow-hidden h-[630px] flex flex-col justify-between shrink-0 select-none">
          
          {/* Dynamic iOS/Android Notch element */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 flex items-center justify-center z-12">
            <span className="h-4 w-20 rounded-b-xl bg-slate-950 block" />
          </div>

          <div className={`flex-1 ${activeThemeClass} rounded-[32px] overflow-hidden p-4 pt-8 text-center flex flex-col justify-between h-full relative`}>
            
            <div className="space-y-5 flex-1 overflow-y-auto scrollbar-none pb-4 font-sans">
              
              {/* Profile Image & Badge */}
              <div className="flex flex-col items-center pt-2 space-y-2 font-sans">
                <img
                  referrerPolicy="no-referrer"
                  src={treeProfile.avatar_url}
                  alt={treeProfile.display_name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-zinc-800 bg-slate-50 shadow-md animate-fadeIn"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-zinc-100 flex items-center justify-center gap-1">
                    {treeProfile.display_name}
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-white text-[8px] font-bold select-none">✓</span>
                  </h3>
                  <span className="text-[10px] text-slate-450 dark:text-zinc-500 font-mono">@{treeProfile.username}</span>
                </div>

                {/* Geographical Tag */}
                <div className="flex items-center justify-center gap-1 text-[9.5px] text-slate-500 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full border dark:border-zinc-800">
                  <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                  <span>{locationRegion}, {locationCountry}</span>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed max-w-[240px] mx-auto select-none font-sans font-medium">
                {treeProfile.bio}
              </p>

              {/* Social Anchors Icons */}
              <div className="flex justify-center gap-3">
                {treeProfile.social_links.instagram && (
                  <a href={treeProfile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-full border dark:border-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm text-slate-500 dark:text-zinc-405">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {treeProfile.social_links.youtube && (
                  <a href={treeProfile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-full border dark:border-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm text-slate-500 dark:text-zinc-405">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {treeProfile.social_links.telegram && (
                  <a href={treeProfile.social_links.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-full border dark:border-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm text-slate-500 dark:text-zinc-405">
                    <Send className="h-4 w-4" />
                  </a>
                )}
                {treeProfile.social_links.facebook && (
                  <a href={treeProfile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-full border dark:border-zinc-805 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm text-slate-500 dark:text-zinc-405">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Contact Information direct button overlay */}
              <div className="grid grid-cols-2 gap-1.5 max-w-[260px] mx-auto text-[10px] font-sans">
                <a href={`mailto:${emailContact}`} className="flex items-center gap-1.5 justify-center bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
                  <Mail className="h-3 w-3 text-blue-500 dark:text-blue-400" /> Email
                </a>
                <a href={`https://wa.me/${whatsappContact.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 justify-center bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
                  <Phone className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> WhatsApp
                </a>
              </div>

              {/* Core Links list */}
              <div className="space-y-2.5 max-w-[260px] mx-auto pt-2">
                {treeProfile.links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSimulateAnalytics('link', link.title)}
                    className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between text-left shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 border cursor-pointer select-none ${activePhoneCardClass}`}
                  >
                    <span className="truncate">{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                ))}
              </div>

              {/* Featured Products lists inside Trees */}
              {selectedProductIds.length > 0 && (
                <div className="space-y-2 max-w-[260px] mx-auto pt-4 text-left font-sans">
                  <span className="text-[9.5px] uppercase font-black text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1 px-1 select-none">
                    <ShoppingBag className="h-3 w-3" /> Featured Products
                  </span>
                  
                  <div className="space-y-2">
                    {availableProducts.filter(p => selectedProductIds.includes(p.id)).map(p => (
                      <div key={p.id} className="p-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold leading-normal">
                        <div className="flex gap-2 items-center min-w-0">
                          <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-8 w-8 object-cover rounded bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800" />
                          <div className="min-w-0 font-sans">
                            <span className="block text-slate-900 dark:text-zinc-250 truncate max-w-[130px]">{p.name}</span>
                            <span className="block text-[9px] text-slate-400 dark:text-zinc-500 font-mono">₹{p.price}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSimulateAnalytics('product')}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] px-2 py-1 font-extrabold border-0 cursor-pointer"
                        >
                          Checkout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated footer logo line */}
            <div className="pt-2 border-t border-slate-200/55 dark:border-zinc-800/80 select-none text-center shrink-0">
              <span className="text-[7.5px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                Powered by Sugora
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
