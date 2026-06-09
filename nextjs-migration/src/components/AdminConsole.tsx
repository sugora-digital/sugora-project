/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, Users, ShieldAlert, FileText, ShoppingCart, DollarSign, 
  Plus, Check, X, Edit3, Lock, Trash2, Award, Sparkles, Layout, 
  Smartphone, BarChart2, MessageSquare, ExternalLink, RefreshCw, Upload, Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Profile, Product, KYCRequest, WithdrawRequest, SiteSettings, WebsiteSettings, CustomPage, SugoraApp } from '../types';
import SugoraLogo from './SugoraLogo';

interface AdminConsoleProps {
  users: Profile[];
  products: Product[];
  kycRequests: KYCRequest[];
  withdrawRequests: WithdrawRequest[];
  siteSettings: SiteSettings;
  websiteSettings: WebsiteSettings;
  customPages: CustomPage[];
  onApproveKYC: (userId: string) => void;
  onRejectKYC: (userId: string) => void;
  onApproveWithdrawal: (reqId: string) => void;
  onAddProduct: (prod: Product) => void;
  onChangeCommission: (rate: number) => void;
  onUpdateWebsiteSettings: (settings: WebsiteSettings) => void;
  onAddCustomPage: (page: CustomPage) => void;
  onDeleteCustomPage: (slug: string) => void;
  onUpdateCustomPage?: (page: CustomPage) => void;
  onUpdateSiteSettings?: (settings: SiteSettings) => void;
  onPurgeAllDemoData?: () => void;
  apps?: SugoraApp[];
  onUpdateApps?: (updatedApps: SugoraApp[]) => void;
  activeSubTab?: 'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings';
  onSubTabChange?: (tab: 'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings') => void;
}

const STATS_CHART_MOCK_DATA = [
  { name: 'Monday', users: 120, sales: 2400, traffic: 3200 },
  { name: 'Tuesday', users: 160, sales: 3800, traffic: 4500 },
  { name: 'Wednesday', users: 190, sales: 3100, traffic: 4200 },
  { name: 'Thursday', users: 240, sales: 5200, traffic: 6100 },
  { name: 'Friday', users: 280, sales: 6800, traffic: 7300 },
  { name: 'Saturday', users: 310, sales: 7400, traffic: 8900 },
  { name: 'Sunday', users: 350, sales: 8100, traffic: 9500 }
];

export default function AdminConsole({
  users,
  products,
  kycRequests,
  withdrawRequests,
  siteSettings,
  websiteSettings,
  customPages,
  onApproveKYC,
  onRejectKYC,
  onApproveWithdrawal,
  onAddProduct,
  onChangeCommission,
  onUpdateWebsiteSettings,
  onAddCustomPage,
  onDeleteCustomPage,
  onUpdateCustomPage,
  onUpdateSiteSettings,
  onPurgeAllDemoData,
  apps,
  onUpdateApps,
  activeSubTab,
  onSubTabChange
}: AdminConsoleProps) {
  const [activeTab, setActiveTab ] = useState<'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings'>('stats');

  const currentTab = activeSubTab !== undefined ? activeSubTab : activeTab;
  const setCurrentTab = onSubTabChange !== undefined ? onSubTabChange : setActiveTab;

  // New product state
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdImg, setNewProdImg] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
  const [newProdPrice, setNewProdPrice] = useState<string>('299');
  const [newProdCategory, setNewProdCategory] = useState<string>('E-Books');
  const [newProdType, setNewProdType] = useState<'digital_download' | 'affiliate_product'>('digital_download');
  const [newProdUrl, setNewProdUrl] = useState<string>('https://sugora.com/downloads/premium-file.zip');
  const [newProdAffUrl, setNewProdAffUrl] = useState<string>('');

  const [commissionRateVal, setCommissionRateVal] = useState<string>(siteSettings.commission_rate.toString());

  // Website Settings Form States
  const [brandName, setBrandName] = useState<string>(websiteSettings.site_name);
  const [brandDesc, setBrandDesc] = useState<string>(websiteSettings.site_description);
  const [brandLogo, setBrandLogo] = useState<string>(websiteSettings.logo_url);
  const [brandFavicon, setBrandFavicon] = useState<string>(websiteSettings.favicon_url);
  const [brandFooterLogo, setBrandFooterLogo] = useState<string>(websiteSettings.footer_logo_url || '');
  const [brandTagline, setBrandTagline] = useState<string>(websiteSettings.tagline || 'Turn Time into Value');
  const [brandEmail, setBrandEmail] = useState<string>(websiteSettings.email || 'ceo.sugora@gmail.com');
  const [brandPhone, setBrandPhone] = useState<string>(websiteSettings.phone || '+91 98765 43210');
  const [brandWhatsapp, setBrandWhatsapp] = useState<string>(websiteSettings.whatsapp || '+91 98765 43210');
  const [brandAddress, setBrandAddress] = useState<string>(websiteSettings.address || 'Sugora Incubations, BKC Silicon Boulevard, Mumbai');
  
  // Expanded Metadata States (Keywords, Open Graph, etc.)
  const [brandKeywords, setBrandKeywords] = useState<string>((websiteSettings as any).keywords || 'sugora, creator economy, link tree, upi wallets, mobile bio');
  const [brandOgTitle, setBrandOgTitle] = useState<string>((websiteSettings as any).og_title || websiteSettings.site_name);
  const [brandOgImage, setBrandOgImage] = useState<string>((websiteSettings as any).og_image || websiteSettings.logo_url);
  const [brandOgDesc, setBrandOgDesc] = useState<string>((websiteSettings as any).og_description || websiteSettings.site_description);

  // Social handles states
  const [brandSocialInstagram, setBrandSocialInstagram] = useState<string>(websiteSettings.social_instagram || 'https://instagram.com/sugora_io');
  const [brandSocialFacebook, setBrandSocialFacebook] = useState<string>(websiteSettings.social_facebook || 'https://facebook.com/sugorapage');
  const [brandSocialTwitter, setBrandSocialTwitter] = useState<string>(websiteSettings.social_twitter || 'https://twitter.com/sugora_tweets');
  const [brandSocialLinkedin, setBrandSocialLinkedin] = useState<string>(websiteSettings.social_linkedin || 'https://linkedin.com/company/sugorainc');
  const [brandSocialYoutube, setBrandSocialYoutube] = useState<string>(websiteSettings.social_youtube || 'https://youtube.com/c/sugoratech');
  const [brandSocialTiktok, setBrandSocialTiktok] = useState<string>(websiteSettings.social_tiktok || '');

  // File Upload dragover states
  const [logoDragOver, setLogoDragOver] = useState<boolean>(false);
  const [favDragOver, setFavDragOver] = useState<boolean>(false);

  // Individual Module Logos States
  const [logoSugoraChat, setLogoSugoraChat] = useState<string>(websiteSettings.logo_sugora_chat || '');
  const [logoAIChat, setLogoAIChat] = useState<string>(websiteSettings.logo_ai_chat || '');
  const [logoSugoraTree, setLogoSugoraTree] = useState<string>(websiteSettings.logo_sugora_tree || '');
  const [logoSugoraShop, setLogoSugoraShop] = useState<string>(websiteSettings.logo_sugora_shop || '');
  const [logoSugoraApps, setLogoSugoraApps] = useState<string>(websiteSettings.logo_sugora_apps || '');

  // Custom Page Creator / Editing States
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [showPageForm, setShowPageForm] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>('');
  const [pageContent, setPageContent] = useState<string>('');
  const [pageSeoTitle, setPageSeoTitle] = useState<string>('');
  const [pageSeoDesc, setPageSeoDesc] = useState<string>('');
  const [pageStatus, setPageStatus] = useState<'Published' | 'Draft'>('Published');
  const [pageTemplate, setPageTemplate] = useState<string>('standard');

  // Site API credentials & dynamic configs state variables
  const [geminiApiKey, setGeminiApiKey] = useState<string>(siteSettings.gemini_api_key || '');
  const [chatgptApiKey, setChatgptApiKey] = useState<string>(siteSettings.chatgpt_api_key || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'chatgpt' | 'mock'>(siteSettings.ai_provider || 'mock');
  const [msgsLimit, setMsgsLimit] = useState<number>(siteSettings.messages_limit || 50);
  const [retentionDays, setRetentionDays] = useState<number>(siteSettings.chat_retention_days || 7);

  // Embedded Apps management state variables
  const [showAddAppForm, setShowAddAppForm] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<SugoraApp | null>(null);
  const [appName, setAppName] = useState<string>('');
  const [appDesc, setAppDesc] = useState<string>('');
  const [appLogo, setAppLogo] = useState<string>('');
  const [appUrl, setAppUrl] = useState<string>('');

  // Derived financial computations
  const approvedVolume = withdrawRequests
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdPrice) {
      alert('All baseline fields are mandatory!');
      return;
    }

    const nProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      description: newProdDesc,
      image_url: newProdImg,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      download_file_url: newProdType === 'digital_download' ? newProdUrl : undefined,
      affiliate_link: newProdType === 'affiliate_product' ? newProdAffUrl : undefined,
      type: newProdType,
      created_at: new Date().toISOString()
    };

    onAddProduct(nProduct);
    alert('Product file successfully appended to the live store!');
    setNewProdName('');
    setNewProdDesc('');
  };

  const handleLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBrandLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBrandFavicon(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWebsiteSettings({
      site_name: brandName,
      site_description: brandDesc,
      logo_url: brandLogo,
      favicon_url: brandFavicon,
      footer_logo_url: brandFooterLogo,
      logo_sugora_chat: logoSugoraChat,
      logo_ai_chat: logoAIChat,
      logo_sugora_tree: logoSugoraTree,
      logo_sugora_shop: logoSugoraShop,
      logo_sugora_apps: logoSugoraApps,
      tagline: brandTagline,
      email: brandEmail,
      phone: brandPhone,
      whatsapp: brandWhatsapp,
      address: brandAddress,
      social_instagram: brandSocialInstagram,
      social_facebook: brandSocialFacebook,
      social_twitter: brandSocialTwitter,
      social_linkedin: brandSocialLinkedin,
      social_youtube: brandSocialYoutube,
      social_tiktok: brandSocialTiktok,
      // Cast metadata values
      keywords: brandKeywords,
      og_title: brandOgTitle,
      og_image: brandOgImage,
      og_description: brandOgDesc
    } as any);
    alert('Website configurations dynamically synchronized in Supabase rules!');
  };

  const handleEditPageInitiate = (page: CustomPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPageSeoTitle(page.seo_title || '');
    setPageSeoDesc(page.seo_description || '');
    setPageStatus(page.status);
    setPageTemplate(page.template || 'standard');
    setShowPageForm(true);
  };

  const handleCreateCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug || !pageContent) {
      alert('Page metadata validation failed! Slug, title and body required.');
      return;
    }

    const cleanSlug = pageSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (editingPage) {
      // Edit / Update mode
      const updatedPage: CustomPage = {
        ...editingPage,
        title: pageTitle,
        slug: cleanSlug,
        content: pageContent,
        seo_title: pageSeoTitle || pageTitle,
        seo_description: pageSeoDesc,
        status: pageStatus,
        template: pageTemplate
      };
      if (onUpdateCustomPage) {
        onUpdateCustomPage(updatedPage);
      } else {
        // Fallback: update in-place in simple structures
        onAddCustomPage(updatedPage);
      }
      alert(`Dynamic Page "/p/${updatedPage.slug}" successfully revised!`);
    } else {
      // Create mode
      if (customPages.some(p => p.slug === cleanSlug)) {
        alert('Page slug collision! This path is already registered under standard routers.');
        return;
      }

      const newPage: CustomPage = {
        id: `page-${Date.now()}`,
        title: pageTitle,
        slug: cleanSlug,
        content: pageContent,
        seo_title: pageSeoTitle || pageTitle,
        seo_description: pageSeoDesc,
        status: pageStatus,
        created_at: new Date().toISOString(),
        template: pageTemplate
      };

      onAddCustomPage(newPage);
      alert(`Dynamic Page "/p/${newPage.slug}" successfully published!`);
    }
    
    // Clear states
    setPageTitle('');
    setPageSlug('');
    setPageContent('');
    setPageSeoTitle('');
    setPageSeoDesc('');
    setEditingPage(null);
    setShowPageForm(false);
  };

  const saveCommissionSetting = () => {
    const rate = parseFloat(commissionRateVal);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      onChangeCommission(rate);
      alert(`Sales referral baseline coefficient upgraded to ${rate}%`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteSettings) {
      onUpdateSiteSettings({
        ...siteSettings,
        gemini_api_key: geminiApiKey,
        chatgpt_api_key: chatgptApiKey,
        ai_provider: aiProvider,
        messages_limit: Number(msgsLimit),
        chat_retention_days: Number(retentionDays),
        gemini_api_configured: geminiApiKey.trim() !== ''
      });
      alert('AI Credentials & Conversation limits updated successfully!');
    }
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appUrl.trim()) return;

    const newApp: SugoraApp = {
      id: editingApp ? editingApp.id : `app-${Date.now()}`,
      name: appName.trim(),
      description: appDesc.trim(),
      logo: appLogo.trim() || 'AppWindow',
      url: appUrl.trim()
    };

    if (onUpdateApps && apps) {
      if (editingApp) {
        onUpdateApps(apps.map(a => a.id === editingApp.id ? newApp : a));
        alert(`App "${newApp.name}" updated successfully!`);
      } else {
        onUpdateApps([...apps, newApp]);
        alert(`New App "${newApp.name}" embedded successfully!`);
      }
    }

    setAppName('');
    setAppDesc('');
    setAppLogo('');
    setAppUrl('');
    setEditingApp(null);
    setShowAddAppForm(false);
  };

  const handleStartEditApp = (app: SugoraApp) => {
    setEditingApp(app);
    setAppName(app.name);
    setAppDesc(app.description);
    setAppLogo(app.logo);
    setAppUrl(app.url);
    setShowAddAppForm(true);
  };

  const handleDeleteApp = (appId: string) => {
    if (window.confirm('Are you sure you want to remove this sandboxed app?') && onUpdateApps && apps) {
      onUpdateApps(apps.filter(a => a.id !== appId));
    }
  };

  const handleClearDemoData = () => {
    if (window.confirm('Are you sure you want to REMOVE all template lists, transactions, and custom pages? Logged-in admin and key structures will be kept clean.')) {
      if (onPurgeAllDemoData) {
        onPurgeAllDemoData();
        alert('All demo lists have been purged successfully! Refreshing to dynamic clean mode.');
      }
    }
  };

  return (
    <div id="admin-management-container" className="space-y-6 bg-slate-50/20 p-1 md:p-4 rounded-3xl animate-fadeIn">
      
      {/* Header section with named switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-5 border-slate-100 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="h-6.5 w-6.5 text-blue-600 animate-pulse" />
            System Control Cabinet
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Authorized admin credentials granted. Monitor traffic, verify KYC credentials, manage website templates, and build dynamic pages.
          </p>
        </div>

        {/* Tab Selection */}
        {!activeSubTab && (
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl w-fit">
            {[
              { key: 'stats', label: 'Dashboard', icon: BarChart2 },
              { key: 'users', label: 'Users Map', icon: Users },
              { key: 'kyc', label: 'KYC Panel', icon: ShieldAlert },
              { key: 'shop', label: 'Inventory', icon: ShoppingCart },
              { key: 'branding', label: 'Branding', icon: Settings },
              { key: 'pages', label: 'Page Builder', icon: Layout },
              { key: 'settings', label: 'Settings', icon: Sliders }
            ].map(tab => {
              const Icon = tab.icon;
              const isSel = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCurrentTab(tab.key as any)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-blue-600 shadow-sm text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. STATS DASHBOARD & CHARTS */}
      {currentTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Total Registered</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-zinc-200 mt-2">{users.length} Creators</h3>
            </div>
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Products Listing</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-zinc-200 mt-2">{products.length} Digital Assets</h3>
            </div>
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Approved Payout Volume</span>
              <h3 className="text-2xl font-black text-green-600 mt-2">₹{approvedVolume.toFixed(2)}</h3>
            </div>
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Total Custom Pages</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-2">{customPages.length} Pages</h3>
            </div>
          </div>

          {/* Interactive Charts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Volume / Revenue */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border dark:border-zinc-800 shadow-sm space-y-4">
              <div className="border-b dark:border-zinc-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">Income & Sales (INR)</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/20 border border-blue-100/30 rounded px-2 text-blue-700 dark:text-blue-400 font-bold font-mono">Week Performance</span>
              </div>
              <div className="h-64 h-full min-h-[220px]">
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={STATS_CHART_MOCK_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} dy={8} />
                    <YAxis stroke="#94A3B8" fontSize={9} dx={-8} />
                    <Tooltip cursor={{ stroke: '#2563EB', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="sales" name="Volume (₹)" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic & User registers */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border dark:border-zinc-800 shadow-sm space-y-4">
              <div className="border-b dark:border-zinc-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">Traffic & Registration Trends</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 rounded px-2 text-emerald-700 dark:text-emerald-400 font-bold font-mono">Real-time data</span>
              </div>
              <div className="h-64 h-full min-h-[220px]">
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={STATS_CHART_MOCK_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                    <YAxis stroke="#94A3B8" fontSize={9} />
                    <Tooltip />
                    <Bar dataKey="users" name="Signups" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="traffic" name="Active Hits (x10)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pending payouts ledger */}
          <div className="rounded-3xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider mb-4">Pending Wallet Cashout Distributions</h3>
            {withdrawRequests.filter(r => r.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No outstanding cashback or commission cashouts audit requests.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-850">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 uppercase font-black text-[10px]">
                    <tr>
                      <th className="p-3.5">User Handle</th>
                      <th className="p-3.5">Gateway / Bank</th>
                      <th className="p-3.5">Beneficiary Credentials</th>
                      <th className="p-3.5">Transfer Sum</th>
                      <th className="p-3.5 text-right">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800 text-slate-650 dark:text-zinc-350 font-medium whitespace-nowrap">
                    {withdrawRequests.filter(r => r.status === 'pending').map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-zinc-200">@{req.username}</td>
                        <td className="p-3.5">{req.method}</td>
                        <td className="p-3.5 font-mono">{req.details}</td>
                        <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">₹{req.amount}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onApproveWithdrawal(req.id)}
                            className="bg-blue-600 font-extrabold px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-[10.5px] transition cursor-pointer"
                          >
                            Disperse Ledger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CREATORS/USERS MAP ACCOUNT TAB */}
      {currentTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Registered Creators</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Vibrant index metrics of all creators onboarded to the Sugora Ecosystem.</p>
            </div>
            <div className="rounded-xl bg-indigo-50 dark:bg-zinc-950 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 flex items-center gap-1.5 select-none animate-bounce">
              <Users className="h-4 w-4" />
              <span>{users.length} Active Accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {users.map((u, idx) => {
              // Vibrant color palettes
              const themes = [
                {
                  border: 'border-[#D1F2E5]',
                  bg: 'bg-gradient-to-br from-[#E8F8F2] to-[#F1FDF8]/90 dark:from-[#0c241c] dark:to-[#040e0b]',
                  accent: 'text-[#0D9488]',
                  accentBg: 'bg-[#0D9488]/10',
                  badgeBg: 'bg-[#D1F2E5] dark:bg-[#0c241c]',
                  ringBg: '#D1F5E5',
                  score: 95
                },
                {
                  border: 'border-[#DCE4FF]',
                  bg: 'bg-gradient-to-br from-[#EDF3FF] to-[#F5F8FF]/90 dark:from-[#0d1e3a] dark:to-[#050b15]',
                  accent: 'text-[#2563EB]',
                  accentBg: 'bg-[#2563EB]/10',
                  badgeBg: 'bg-[#DCE4FF] dark:bg-[#0d1e3a]',
                  ringBg: '#E2E7FF',
                  score: 87
                },
                {
                  border: 'border-[#E9D5FF]',
                  bg: 'bg-gradient-to-br from-[#F3E8FF] to-[#FAF5FF]/90 dark:from-[#211234] dark:to-[#0b0512]',
                  accent: 'text-[#7C3AED]',
                  accentBg: 'bg-[#7C3AED]/10',
                  badgeBg: 'bg-[#E9D5FF] dark:bg-[#211234]',
                  ringBg: '#F5EEFF',
                  score: 79
                },
                {
                  border: 'border-[#FDE2E4]',
                  bg: 'bg-gradient-to-br from-[#FFEBEF] to-[#FFF5F6]/90 dark:from-[#35101a] dark:to-[#120509]',
                  accent: 'text-[#E11D48]',
                  accentBg: 'bg-[#E11D48]/10',
                  badgeBg: 'bg-[#FDE2E4] dark:bg-[#43101c]',
                  ringBg: '#FFE3E7',
                  score: 92
                },
                {
                  border: 'border-[#FFE7D1]',
                  bg: 'bg-gradient-to-br from-[#FFF3E8] to-[#FFFAF5]/90 dark:from-[#2d1b06] dark:to-[#0e0802]',
                  accent: 'text-[#D97706]',
                  accentBg: 'bg-[#D97706]/10',
                  badgeBg: 'bg-[#FFE7D1] dark:bg-[#2d1b06]',
                  ringBg: '#FFF0E0',
                  score: 84
                }
              ];
              const card = themes[idx % themes.length];

              return (
                <div 
                  key={u.id} 
                  className={`rounded-[28px] border border-solid ${card.border} dark:border-zinc-800 ${card.bg} p-6 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/30 rounded-full blur-2xl" />

                  {/* Profile Header Block */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-solid border-white dark:border-zinc-850 flex items-center justify-center font-black text-sm text-white shadow-xs bg-indigo-550/80 uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5 truncate max-w-[130px]">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 leading-tight block">{u.name}</h4>
                        <span className="text-[10px] text-slate-450 dark:text-zinc-500 font-mono font-bold block">@{u.username}</span>
                      </div>
                    </div>

                    <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shrink-0 ${card.badgeBg} ${card.accent}`}>
                      {u.role}
                    </div>
                  </div>

                  {/* Identity verification status */}
                  <div className="flex items-center justify-between bg-white/50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-solid border-white/45 dark:border-zinc-800/30">
                    {u.is_verified ? (
                      <div className="flex items-center gap-1 text-[#0D9488] font-black text-[10px] uppercase">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-spin" />
                        <span>Verified Elite Creator</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500 font-extrabold text-[10px] uppercase">
                        <span>Standard Partner</span>
                      </div>
                    )}
                    <span className="text-[9.5px] font-mono text-slate-400 dark:text-zinc-500">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Stats circle and scoring */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200/50 dark:border-zinc-800/60 font-sans">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Activity Score</span>
                      <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-200">{card.score}%</span>
                    </div>

                    <div className="h-11 w-11 flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r="16" fill="transparent" stroke="#2D3748" strokeWidth="2.5" opacity="0.1" />
                        <circle cx="22" cy="22" r="16" fill="transparent" stroke={card.accent.includes('0D9488') ? '#0D9488' : card.accent.includes('2563EB') ? '#2563EB' : card.accent.includes('7C3AED') ? '#7C3AED' : card.accent.includes('E11D48') ? '#E11D48' : '#D97706'} strokeWidth="2.5" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - card.score / 100)}`} />
                      </svg>
                      <span className={`absolute text-[9.5px] font-black font-mono ${card.accent}`}>{card.score}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. KYC COMPLIANCE WORKFLOW */}
      {currentTab === 'kyc' && (
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-wider">Compliance KYC Panel</h3>
          {kycRequests.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">All identity validation requests have been processed.</p>
          ) : (
            <div className="space-y-4">
              {kycRequests.map(req => (
                <div key={req.id} className="p-5 bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">{req.full_name}</span>
                      <span className="font-mono text-slate-400 dark:text-zinc-500">(@{req.username})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 max-w-md font-mono">
                      <span>PAN: {req.pan_card}</span>
                      <span>Aadhaar: {req.aadhaar_card}</span>
                      <span className="col-span-1 sm:col-span-2">Address: {req.address}</span>
                    </div>
                    <div>
                      <span className={`inline-block text-[9.5px] font-black uppercase text-indigo-600`}>
                        Fulfillment: {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRejectKYC(req.id)}
                        className="rounded-xl border border-red-200 dark:border-red-950 text-red-700 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-rose-950/20 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => onApproveKYC(req.id)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                      >
                        <Check className="h-4 w-4" /> Approve Verifications
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. DIGITAL SHOP INVENTORY PRODUCTS APPENDS */}
      {currentTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Append product form */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-5 shadow-sm lg:col-span-7">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Plus className="h-4.5 w-4.5 text-blue-600" /> Create Digital Asset Link
            </h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-bold text-slate-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TikTok Reels Viral Blueprint"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1">Description</label>
                <textarea
                  required
                  placeholder="Insert core template and growth benefits..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 h-20 resize-none focus:ring-1 focus:ring-blue-500 outline-none text-slate-805 dark:text-zinc-200 leading-relaxed font-semibold font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Category Selector</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="E-Books">E-Books</option>
                    <option value="Design Templates">Design Templates</option>
                    <option value="Affiliate Services">Affiliate Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Delivery Fulfillment</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as any)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="digital_download">Direct File Download link</option>
                    <option value="affiliate_product">External Affiliate redirection</option>
                  </select>
                </div>
              </div>

              {newProdType === 'digital_download' ? (
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Direct Download File URL / Zip Link</label>
                  <input
                    type="text"
                    value={newProdUrl}
                    onChange={(e) => setNewProdUrl(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 focus:outline-none text-slate-800 dark:text-zinc-200 font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">External Affiliate referral URL</label>
                  <input
                    type="text"
                    placeholder="https://affiliates.com/track-id"
                    value={newProdAffUrl}
                    onChange={(e) => setNewProdAffUrl(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 focus:outline-none text-slate-800 dark:text-zinc-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1">Asset Cover graphic Image link</label>
                <input
                  type="text"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 text-xs border dark:border-zinc-800 focus:outline-none text-slate-850 dark:text-zinc-200 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Assemble Store Product Card
              </button>
            </form>
          </div>

          {/* Current products list */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-5 shadow-sm lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Active Inventory ({products.length} assets)</h3>
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {products.map(p => (
                <div key={p.id} className="flex gap-3 items-center border-b dark:border-zinc-800 pb-3 border-slate-100 mt-1">
                  <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded bg-slate-50 border dark:border-zinc-850" />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="block font-bold text-slate-850 dark:text-zinc-200 truncate">{p.name}</span>
                    <span className="block text-[9.5px] text-slate-400 font-mono">{p.category} • ₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BRANDING & CONTACT SETTINGS */}
      {currentTab === 'branding' && (
        <div id="website-setting-wrap" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-indigo-600" /> Branding, Metadata, & Core Settings
              </h3>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full font-bold">
                Live Preview Enabled
              </span>
            </div>

            <form onSubmit={handleUpdateBranding} className="space-y-6 text-xs text-slate-500 font-bold">
              
              {/* BRAND BASIC INFO */}
              <div className="space-y-3 text-slate-600 dark:text-zinc-300">
                <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-2 font-black">Basic Brand Profiling</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Company / Website Name</label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Slogan Tagline</label>
                    <input
                      type="text"
                      required
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* ASSETS INPUTS */}
              <div className="space-y-4 text-slate-600 dark:text-zinc-300">
                <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-2 font-black">Website Assets Logos</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Brand logo URL input */}
                  <div className="space-y-2">
                    <label className="block text-[9px] uppercase tracking-wider">Site Brand Header Logo URL</label>
                    <input
                      type="text"
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-100 focus:outline-none font-mono text-[11px]"
                    />
                    {brandLogo && (
                      <div className="border rounded-xl p-2 bg-white dark:bg-zinc-950/40 flex justify-center">
                        <img src={brandLogo} referrerPolicy="no-referrer" alt="Header brand logo look" className="h-6 w-auto object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Brand favicon URL input */}
                  <div className="space-y-2">
                    <label className="block text-[9px] uppercase tracking-wider">Site Favicon URL Override (.ico / .png)</label>
                    <input
                      type="text"
                      value={brandFavicon}
                      onChange={(e) => setBrandFavicon(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-100 focus:outline-none font-mono text-[11px]"
                    />
                    {brandFavicon && (
                      <div className="border rounded-xl p-2 bg-white dark:bg-zinc-950/40 flex justify-center">
                        <img src={brandFavicon} referrerPolicy="no-referrer" alt="Favicon look preview" className="h-6 w-6 object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Footer/Drawer Logo URL (Secondary)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo-footer.png"
                      value={brandFooterLogo}
                      onChange={(e) => setBrandFooterLogo(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* MODULE SPECIFIC PLATFORM LOGOS */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-slate-650 dark:text-zinc-300">
                  <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-emerald-500 pl-2 font-black">
                    Module Logo Overrides (Dynamic Header Change)
                  </h4>
                  <p className="text-[11px] text-slate-450 dark:text-zinc-500 font-semibold">
                    Configure custom branding logos for each separate application module. When a user switches tabs, the respective logo replaces the header standard brand logo instantly.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Sugora Chat Logo */}
                    <div className="space-y-2 bg-slate-50/55 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-850">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-550 dark:text-zinc-400 font-bold">💬 Sugora Chat Logo</label>
                      <input
                        type="text"
                        placeholder="https://example.com/chat-logo.png"
                        value={logoSugoraChat}
                        onChange={(e) => setLogoSugoraChat(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 p-2 text-[10px] font-mono focus:outline-none text-slate-800 dark:text-zinc-200"
                      />
                      {logoSugoraChat && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img referrerPolicy="no-referrer" src={logoSugoraChat} alt="Chat logo look" className="h-7 w-7 object-cover rounded-lg border dark:border-zinc-800" />
                          <span className="text-[9px] text-emerald-600 font-mono">Live Preset</span>
                        </div>
                      )}
                    </div>

                    {/* AI Chat Logo */}
                    <div className="space-y-2 bg-slate-50/55 dark:bg-zinc-955/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-850">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-550 dark:text-zinc-400 font-bold font-bold">✨ AI Copilot Logo</label>
                      <input
                        type="text"
                        placeholder="https://example.com/ai-logo.png"
                        value={logoAIChat}
                        onChange={(e) => setLogoAIChat(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 p-2 text-[10px] font-mono focus:outline-none text-slate-800 dark:text-zinc-200"
                      />
                      {logoAIChat && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img referrerPolicy="no-referrer" src={logoAIChat} alt="AI logo look" className="h-7 w-7 object-cover rounded-lg border dark:border-zinc-800" />
                          <span className="text-[9px] text-emerald-600 font-mono">Live Preset</span>
                        </div>
                      )}
                    </div>

                    {/* Sugora Tree Logo */}
                    <div className="space-y-2 bg-slate-50/55 dark:bg-zinc-955/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-850">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-550 dark:text-zinc-400 font-bold font-bold">🌿 Sugora Tree Logo</label>
                      <input
                        type="text"
                        placeholder="https://example.com/tree-logo.png"
                        value={logoSugoraTree}
                        onChange={(e) => setLogoSugoraTree(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 p-2 text-[10px] font-mono focus:outline-none text-slate-800 dark:text-zinc-205"
                      />
                      {logoSugoraTree && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img referrerPolicy="no-referrer" src={logoSugoraTree} alt="Tree logo look" className="h-7 w-7 object-cover rounded-lg border dark:border-zinc-800" />
                          <span className="text-[9px] text-emerald-600 font-mono">Live Preset</span>
                        </div>
                      )}
                    </div>

                    {/* Sugora Shop Logo */}
                    <div className="space-y-2 bg-slate-50/55 dark:bg-zinc-955/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-850">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-550 dark:text-zinc-400 font-bold font-bold">🛒 Sugora Shop Logo</label>
                      <input
                        type="text"
                        placeholder="https://example.com/shop-logo.png"
                        value={logoSugoraShop}
                        onChange={(e) => setLogoSugoraShop(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 p-2 text-[10px] font-mono focus:outline-none text-slate-800 dark:text-zinc-205"
                      />
                      {logoSugoraShop && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img referrerPolicy="no-referrer" src={logoSugoraShop} alt="Shop logo look" className="h-7 w-7 object-cover rounded-lg border dark:border-zinc-800" />
                          <span className="text-[9px] text-emerald-600 font-mono">Live Preset</span>
                        </div>
                      )}
                    </div>

                    {/* Sugora Apps Logo */}
                    <div className="space-y-2 bg-slate-50/55 dark:bg-zinc-955/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-850">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-550 dark:text-zinc-400 font-bold font-bold">📱 Sugora Apps Logo</label>
                      <input
                        type="text"
                        placeholder="https://example.com/apps-logo.png"
                        value={logoSugoraApps}
                        onChange={(e) => setLogoSugoraApps(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 p-2 text-[10px] font-mono focus:outline-none text-slate-800 dark:text-zinc-205"
                      />
                      {logoSugoraApps && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img referrerPolicy="no-referrer" src={logoSugoraApps} alt="Apps logo look" className="h-7 w-7 object-cover rounded-lg border dark:border-zinc-800" />
                          <span className="text-[9px] text-emerald-600 font-mono">Live Preset</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE SEO & SYSTEM METADATA */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-2 font-black">SEO Engine & Metadata Settings</h4>
                <div className="space-y-3 bg-slate-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Meta Keywords (SEO Indexing, Comma-Separated)</label>
                    <input
                      type="text"
                      value={brandKeywords}
                      onChange={(e) => setBrandKeywords(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2.5 text-slate-850 dark:text-zinc-150 focus:outline-none font-medium"
                      placeholder="sugora, wallet portal, automated chat"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider mb-1">Open Graph / Facebook Title</label>
                      <input
                        type="text"
                        value={brandOgTitle}
                        onChange={(e) => setBrandOgTitle(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider mb-1">Open Graph Core Image URL</label>
                      <input
                        type="text"
                        value={brandOgImage}
                        onChange={(e) => setBrandOgImage(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Open Graph Page Description</label>
                    <textarea
                      value={brandOgDesc}
                      onChange={(e) => setBrandOgDesc(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2.5 h-16 resize-none text-slate-800 dark:text-zinc-100 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* COMMUNICATIONS & CONTACTS */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-indigo-505 pl-2 font-black">Corporate Contacts & Channels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Support Contact Email</label>
                    <input
                      type="email"
                      required
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-105 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Corporate Phone Hotline</label>
                    <input
                      type="text"
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-105 focus:outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">WhatsApp Broadcast Link / Group URL</label>
                    <input
                      type="text"
                      value={brandWhatsapp}
                      onChange={(e) => setBrandWhatsapp(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-105 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Corporate Office HQ Address</label>
                    <input
                      type="text"
                      value={brandAddress}
                      onChange={(e) => setBrandAddress(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-800 dark:text-zinc-105 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SOCIAL MEDIA HANDLES (Propagates dynamically into footer) */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-indigo-505 pl-2 font-black font-sans">Global Social Media Configurations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Instagram Link</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/handle"
                      value={brandSocialInstagram}
                      onChange={(e) => setBrandSocialInstagram(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-805 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Facebook Link</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/handle"
                      value={brandSocialFacebook}
                      onChange={(e) => setBrandSocialFacebook(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850 p-2.5 text-slate-805 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Twitter / X Link</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/handle"
                      value={brandSocialTwitter}
                      onChange={(e) => setBrandSocialTwitter(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-855 p-2.5 text-slate-805 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">LinkedIn Business Profile Link</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/company/handle"
                      value={brandSocialLinkedin}
                      onChange={(e) => setBrandSocialLinkedin(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-855 p-2.5 text-slate-850 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/c/handle"
                      value={brandSocialYoutube}
                      onChange={(e) => setBrandSocialYoutube(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-855 p-2.5 text-slate-850 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">TikTok handle Link</label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@handle"
                      value={brandSocialTiktok}
                      onChange={(e) => setBrandSocialTiktok(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-855 p-2.5 text-slate-850 dark:text-zinc-105 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 py-3 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Check className="h-4.5 w-4.5" /> Save Website Configurations
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Web Branding Card Preview */}
            <div className="bg-gradient-to-tr from-indigo-50 to-indigo-15 border border-indigo-100/30 rounded-3xl p-5 shadow-sm space-y-4 dark:from-zinc-900 dark:to-zinc-950">
              <h3 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Branding Card Preview</h3>
              <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-805 rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center text-center space-y-3.5">
                {brandLogo ? (
                  <img src={brandLogo} referrerPolicy="no-referrer" alt="Header branding look" className="h-10 w-auto object-contain max-w-[170px]" />
                ) : (
                  <SugoraLogo className="h-10" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 leading-tight">{brandName || 'Sugora Link Portal'}</h4>
                  <p className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400 uppercase tracking-wider font-mono mt-0.5">{brandTagline || 'Turn Time into Value'}</p>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-450 dark:text-zinc-450 mt-1 border-t dark:border-zinc-800 pt-2 w-full">
                  {brandDesc || 'No global description registered. Insert custom summaries to bolster Google page indexes.'}
                </div>
                <div className="w-full bg-slate-50/50 dark:bg-zinc-900/40 p-2.5 text-left rounded-lg text-[9px] font-mono leading-relaxed border dark:border-zinc-800 space-y-1">
                  <div><strong className="text-slate-600 dark:text-zinc-400">Email:</strong> {brandEmail}</div>
                  <div><strong className="text-slate-600 dark:text-zinc-400">Phone:</strong> {brandPhone}</div>
                  <div><strong className="text-slate-600 dark:text-zinc-400">Whatsapp:</strong> {brandWhatsapp}</div>
                  <div><strong className="text-slate-600 dark:text-zinc-400 font-sans">HQ Address:</strong> {brandAddress}</div>
                </div>
              </div>
            </div>

            {/* Sales commission adjustments */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Smartphone className="h-4.5 w-4.5 text-indigo-600" /> Affiliate baseline rate
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-405 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Universal Commission Percentage (%)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionRateVal}
                      onChange={(e) => setCommissionRateVal(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-zinc-950 px-3.5 py-2.5 border dark:border-zinc-800 w-24 text-xs font-mono font-bold text-slate-800 dark:text-zinc-100"
                    />
                    <button
                      onClick={saveCommissionSetting}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-xs cursor-pointer active:scale-95 transition"
                    >
                      Update Rates
                    </button>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-relaxed bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border dark:border-zinc-800 font-medium">
                  System warning: modifying active universal coefficients recalibrates current KYC and wallet withdrawal metrics instantaneously in the background.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CUSTOM PAGE BUILDER (DYNAMIC LAYOUT CREATOR) */}
      {currentTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Dynamic Page Builder</h3>
              <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-semibold">Publish landing copies, terms, or about pages dynamically.</p>
            </div>
            <button
              onClick={() => setShowPageForm(!showPageForm)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-xs text-white py-2.5 px-4 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
            >
              <Layout className="h-4.5 w-4.5" />
              <span>{showPageForm ? 'Review Catalog' : 'Add Custom Page'}</span>
            </button>
          </div>

          {/* New Page Form */}
          {showPageForm ? (
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-350 uppercase tracking-wider mb-4">Draft Custom Page</h3>
              
              <form onSubmit={handleCreateCustomPage} className="space-y-4 text-xs font-bold text-slate-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Page Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Terms of Use Agreement"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                      }}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Public URL Path Slug</label>
                    <div className="flex items-center bg-slate-50 dark:bg-zinc-950 rounded-xl border dark:border-zinc-800 px-3">
                      <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-mono select-none">/p/</span>
                      <input
                        type="text"
                        required
                        placeholder="terms-agreement"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                        className="bg-transparent border-none py-2.5 pl-1 text-slate-800 dark:text-zinc-250 focus:outline-none w-full font-mono text-[10.5px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">SEO Title Header</label>
                    <input
                      type="text"
                      placeholder="Custom browser tab title..."
                      value={pageSeoTitle}
                      onChange={(e) => setPageSeoTitle(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Template Aesthetic Layout</label>
                    <select
                      value={pageTemplate}
                      onChange={(e) => setPageTemplate(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="standard">Standard simple article layout</option>
                      <option value="landing">Premium conversions sales layout</option>
                      <option value="support">Compliance / legal details sheet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">SEO Meta Description tag</label>
                  <input
                    type="text"
                    placeholder="Provide short search engine summaries..."
                    value={pageSeoDesc}
                    onChange={(e) => setPageSeoDesc(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-2.5 text-slate-800 dark:text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Interactive Page Content (HTML & Markdown friendly)</label>
                  <textarea
                    required
                    placeholder="<h1>Dynamic Agreement</h1><p>Introduce content blocks here...</p>"
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 p-3 h-52 resize-none text-slate-800 dark:text-zinc-200 font-mono text-[10.5px] leading-relaxed leading-snug font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border dark:border-zinc-800">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-slate-450 uppercase font-black tracking-wide">Publish Status:</span>
                    <select
                      value={pageStatus}
                      onChange={(e) => setPageStatus(e.target.value as any)}
                      className="bg-white dark:bg-zinc-920 border dark:border-zinc-800 rounded text-[10px] px-1 font-bold outline-none text-slate-800 dark:text-zinc-200"
                    >
                      <option value="Published">Published (Live instantly)</option>
                      <option value="Draft">Draft Save (Private)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 font-sans">
                    <button type="button" onClick={() => { setShowPageForm(false); setEditingPage(null); }} className="px-4 py-2 border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1 shadow-sm cursor-pointer">
                      <Check className="h-4 w-4" /> {editingPage ? 'Save Changes' : 'Publish Page'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Pages catalog list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customPages.map(page => (
                <div key={page.id} className="group bg-white dark:bg-zinc-900 rounded-3xl p-5 border dark:border-zinc-805 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-900 transition duration-150">
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 text-indigo-700 dark:text-indigo-400 font-extrabold text-[9px] uppercase px-2.5 py-1">
                        /p/{page.slug}
                      </span>

                      <span className={`rounded-xl px-2 py-0.5 text-[9px] font-extrabold uppercase border ${
                        page.status === 'Published' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-105/30' 
                          : 'bg-slate-100 dark:bg-zinc-950 text-slate-400 border-slate-150 dark:border-zinc-800'
                      }`}>
                        {page.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-zinc-150 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">{page.title}</h4>
                    <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-1 lines-clamp-3 block font-semibold">{page.seo_description || 'No meta index description loaded.'}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t dark:border-zinc-800 flex justify-between items-center shrink-0">
                    <span className="text-[9.5px] text-slate-400 font-mono">Template: {page.template}</span>
                    
                    <div className="flex items-center gap-1.5 font-sans">
                      <button
                        onClick={() => handleEditPageInitiate(page)}
                        className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-indigo-50 dark:hover:bg-indigo-955/40 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300 flex items-center justify-center border dark:border-zinc-800 transition cursor-pointer"
                        title="Edit Page"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDeleteCustomPage(page.slug)}
                        className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-red-50 dark:hover:bg-red-955/20 text-slate-400 hover:text-red-650 dark:text-zinc-500 dark:hover:text-red-400 flex items-center justify-center border dark:border-zinc-800 transition cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {customPages.length === 0 && (
                <div className="md:col-span-2 text-center py-10 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500 font-bold font-sans">
                  No dynamic pages found. Click "Add Custom Page" to create.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. SETTINGS AND DYNAMIC APP EMBEDS */}
      {currentTab === 'settings' && (
        <div className="space-y-6 animate-fadeIn">
          {/* AI Settings Form */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">AI Integration Configurator</h2>
              <p className="text-xs text-slate-400 mt-0.5">Admin console credentials locker. Activate ChatGPT, Google Gemini integration models instantly.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default AI Chat Provider</label>
                  <select
                    value={aiProvider}
                    onChange={(e: any) => setAiProvider(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-xs font-semibold focus:outline-none text-slate-800 dark:text-zinc-200"
                  >
                    <option value="mock">Sandbox Simulator / Support Helper (No API key needed)</option>
                    <option value="gemini">Google Gemini AI API (gemini-2.5-flash)</option>
                    <option value="chatgpt">OpenAI ChatGPT API (gpt-4o-mini)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">User Daily Message Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={msgsLimit}
                    onChange={(e) => setMsgsLimit(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-205 dark:border-zinc-800 px-3 py-2.5 text-xs font-semibold focus:outline-none text-slate-850 dark:text-zinc-120"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-955 border border-slate-205 dark:border-zinc-800 px-3 py-2.5 text-xs font-mono focus:outline-none text-slate-850 dark:text-zinc-120"
                    placeholder="AI_STUDIO_KEY..."
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-550 mt-1 font-semibold">If blank, falls back to `process.env.GEMINI_API_KEY` or mock assistant.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">OpenAI ChatGPT API Key</label>
                  <input
                    type="password"
                    value={chatgptApiKey}
                    onChange={(e) => setChatgptApiKey(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-955 border border-slate-205 dark:border-zinc-800 px-3 py-2.5 text-xs font-mono focus:outline-none text-slate-850 dark:text-zinc-120"
                    placeholder="sk-proj-..."
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-550 mt-1 font-semibold font-sans">Allows prompting OpenAI directly with server-to-server secure routing.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chat History Retention (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-205 dark:border-zinc-800 px-3 py-2.5 text-xs font-semibold focus:outline-none text-slate-850 dark:text-zinc-120"
                    placeholder="e.g. 7"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-550 mt-1 font-semibold">Old conversations and responses exceeding this threshold are safely pruned.</p>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white font-bold py-3 text-xs transition active:scale-95 cursor-pointer"
                  >
                    Save API & Retention Config
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Apps Embed config */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100 font-sans">Sugora Embedded Apps Hub</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">Embed, edit, and audit responsive external custom sites on the main platform hub as safe frames.</p>
              </div>
              <button
                onClick={() => {
                  setEditingApp(null);
                  setAppName('');
                  setAppDesc('');
                  setAppLogo('🖥️');
                  setAppUrl('');
                  setShowAddAppForm(!showAddAppForm);
                }}
                className="rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 font-extrabold px-3 py-2 text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer text-slate-700 dark:text-zinc-300"
              >
                <Plus className="h-4 w-4" /> {showAddAppForm ? 'Close Editor' : 'Embed New Site'}
              </button>
            </div>

            {showAddAppForm && (
              <form onSubmit={handleSaveApp} className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
                  {editingApp ? `Edit Embedded App: ${editingApp.name}` : 'Embed Custom External Site'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-404 dark:text-zinc-500 uppercase mb-1">App Name</label>
                    <input
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg px-2.5 py-2 text-slate-850 dark:text-zinc-300 text-xs font-semibold focus:outline-none"
                      placeholder="e.g. My Portfolio Sheet"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-404 dark:text-zinc-500 uppercase mb-1">App Icon Emoji / Logo</label>
                    <input
                      type="text"
                      value={appLogo}
                      onChange={(e) => setAppLogo(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg px-2.5 py-2 text-slate-850 dark:text-zinc-300 text-xs focus:outline-none"
                      placeholder="e.g. 📊 or ShopBag"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 font-sans">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-404 dark:text-zinc-500 uppercase mb-1">Embedded iframe URL</label>
                    <input
                      type="url"
                      required
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg px-2.5 py-2 text-slate-850 dark:text-zinc-300 text-xs font-mono font-semibold focus:outline-none"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-404 dark:text-zinc-500 uppercase mb-1">App Description</label>
                    <textarea
                      value={appDesc}
                      onChange={(e) => setAppDesc(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg px-2.5 py-2 text-slate-850 dark:text-zinc-300 text-xs focus:outline-none h-16 h-full"
                      placeholder="Provide helpful description text..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAppForm(false);
                      setEditingApp(null);
                    }}
                    className="px-4 py-2 border dark:border-zinc-800 rounded-xl text-xs font-extrabold text-slate-500 bg-white dark:bg-zinc-900 hover:bg-slate-5 dark:hover:bg-zinc-800 hover:text-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:opacity-95 text-white font-black text-xs transition cursor-pointer"
                  >
                    {editingApp ? 'Save Changes' : 'Embed App'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans animate-fadeIn">
              {apps && apps.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/20 flex justify-between items-start">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">{app.logo || '🌐'}</span>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate leading-none">{app.name}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-2 leading-relaxed font-semibold">{app.description || 'No description listed.'}</p>
                    <div className="text-[9.5px] font-mono text-indigo-700 dark:text-indigo-400 truncate font-semibold pt-1">{app.url}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditApp(app)}
                      className="p-1.5 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-indigo-950/30 hover:text-blue-600 dark:hover:text-blue-300 transition cursor-pointer"
                      title="Edit Embedded App"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-1.5 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-rose-950/30 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
                      title="Remove App"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {(!apps || apps.length === 0) && (
                <div className="col-span-2 text-center py-10 bg-slate-50 dark:bg-zinc-950/20 border border-dashed dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-550 font-bold">
                  No custom apps embedded yet. Click "Embed New Site" to start!
                </div>
              )}
            </div>
          </div>

          {/* Purge Demo Zone */}
          <div className="bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/20 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-5 w-5 animate-bounce" /> Danger Zone: Factory Reset System
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-semibold">
                This reset purges all custom website brand layouts, transaction items, messages history, and app templates. It reverts the Sugora workspace to initial factory-fresh state.
              </p>
            </div>
            <button
              onClick={handleClearDemoData}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-xl transition cursor-pointer"
            >
              Purge Workspace & Re-seed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
