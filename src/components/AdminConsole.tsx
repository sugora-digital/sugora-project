/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, Users, ShieldAlert, FileText, ShoppingCart, DollarSign, 
  Plus, Check, X, Edit3, Lock, Trash2, Award, Sparkles, Layout, 
  Smartphone, BarChart2, MessageSquare, ExternalLink, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Profile, Product, KYCRequest, WithdrawRequest, SiteSettings, WebsiteSettings, CustomPage } from '../types';

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
  onDeleteCustomPage
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages'>('stats');

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

  // Custom Page Creator States
  const [showPageForm, setShowPageForm] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>('');
  const [pageContent, setPageContent] = useState<string>('');
  const [pageSeoTitle, setPageSeoTitle] = useState<string>('');
  const [pageSeoDesc, setPageSeoDesc] = useState<string>('');
  const [pageStatus, setPageStatus] = useState<'Published' | 'Draft'>('Published');
  const [pageTemplate, setPageTemplate] = useState<string>('standard');

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

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWebsiteSettings({
      site_name: brandName,
      site_description: brandDesc,
      logo_url: brandLogo,
      favicon_url: brandFavicon,
      footer_logo_url: brandFooterLogo,
      tagline: brandTagline,
      email: brandEmail,
      phone: brandPhone,
      whatsapp: brandWhatsapp,
      address: brandAddress
    });
    alert('Website configurations dynamically synchronized in Supabase rules!');
  };

  const handleCreateCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug || !pageContent) {
      alert('Page metadata validation failed! Slug, title and body required.');
      return;
    }

    if (customPages.some(p => p.slug === pageSlug)) {
      alert('Page slug collision! This path is already registered under standard routers.');
      return;
    }

    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      title: pageTitle,
      slug: pageSlug.toLowerCase().trim().replace(/\s+/g, '-'),
      content: pageContent,
      seo_title: pageSeoTitle || pageTitle,
      seo_description: pageSeoDesc,
      status: pageStatus,
      created_at: new Date().toISOString(),
      template: pageTemplate
    };

    onAddCustomPage(newPage);
    alert(`Dynamic Page "/p/${newPage.slug}" successfully published!`);
    
    // Clear states
    setPageTitle('');
    setPageSlug('');
    setPageContent('');
    setPageSeoTitle('');
    setPageSeoDesc('');
    setShowPageForm(false);
  };

  const saveCommissionSetting = () => {
    const rate = parseFloat(commissionRateVal);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      onChangeCommission(rate);
      alert(`Sales referral baseline coefficient upgraded to ${rate}%`);
    }
  };

  return (
    <div id="admin-management-container" className="space-y-6 bg-slate-50/20 p-1 md:p-4 rounded-3xl">
      
      {/* Header section with named switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-5 border-slate-105 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Lock className="h-6.5 w-6.5 text-blue-600 animate-pulse" />
            System Control Cabinet
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Authorized admin credentials granted. Monitor traffic, verify KYC credentials, manage website templates, and build dynamic pages.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
          {[
            { key: 'stats', label: 'Dashboard', icon: BarChart2 },
            { key: 'users', label: 'Users Map', icon: Users },
            { key: 'kyc', label: 'KYC Panel', icon: ShieldAlert },
            { key: 'shop', label: 'Inventory', icon: ShoppingCart },
            { key: 'branding', label: 'Branding', icon: Settings },
            { key: 'pages', label: 'Page Builder', icon: Layout }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-blue-600 shadow-sm text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. STATS DASHBOARD & CHARTS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Total Registered</span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{users.length} Creators</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Products Listing</span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{products.length} Digital Assets</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Approved Payout Volume</span>
              <h3 className="text-2xl font-black text-green-600 mt-2">₹{approvedVolume.toFixed(2)}</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Total Custom Pages</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-2">{customPages.length} Pages</h3>
            </div>
          </div>

          {/* Interactive Charts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Volume / Revenue */}
            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">Income & Sales (INR)</span>
                <span className="text-[10px] bg-blue-50 border border-blue-100 rounded px-2 text-blue-700 font-bold font-mono">Week Performance</span>
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
            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">Traffic & Registration Trends</span>
                <span className="text-[10px] bg-emerald-50 border border-emerald-100 rounded px-2 text-emerald-700 font-bold font-mono">Real-time data</span>
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
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Pending Wallet Cashout Distributions</h3>
            {withdrawRequests.filter(r => r.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No outstanding cashback or commission cashouts audit requests.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px]">
                    <tr>
                      <th className="p-3.5">User Handle</th>
                      <th className="p-3.5">Gateway / Bank</th>
                      <th className="p-3.5">Beneficiary Credentials</th>
                      <th className="p-3.5">Transfer Sum</th>
                      <th className="p-3.5 text-right">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-650 font-medium">
                    {withdrawRequests.filter(r => r.status === 'pending').map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">@{req.username}</td>
                        <td className="p-3.5">{req.method}</td>
                        <td className="p-3.5 font-mono">{req.details}</td>
                        <td className="p-3.5 font-bold text-indigo-600">₹{req.amount}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onApproveWithdrawal(req.id)}
                            className="bg-blue-600 font-extrabold px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-[10.5px] transition"
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
      {activeTab === 'users' && (
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Creators</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Username Handle</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">System Role</th>
                  <th className="p-3.5">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600 font-semibold">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 font-mono">@{u.username}</td>
                    <td className="p-3.5">
                      <span className={`rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase border ${
                        u.is_verified 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                          : 'bg-slate-50 text-slate-450 border-slate-100'
                      }`}>
                        {u.is_verified ? 'Verified Creator' : 'Standard'}
                      </span>
                    </td>
                    <td className="p-3.5 capitalize">{u.role}</td>
                    <td className="p-3.5">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. KYC COMPLIANCE WORKFLOW */}
      {activeTab === 'kyc' && (
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compliance KYC Panel</h3>
          {kycRequests.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">All identity validation requests have been processed.</p>
          ) : (
            <div className="space-y-4">
              {kycRequests.map(req => (
                <div key={req.id} className="p-5 bg-slate-50 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{req.full_name}</span>
                      <span className="font-mono text-slate-400">(@{req.username})</span>
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
                        className="rounded-xl border border-red-200 text-red-700 bg-white hover:bg-red-50 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => onApproveKYC(req.id)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-sm"
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
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Append product form */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm lg:col-span-7">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1">
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
                    className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
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
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border h-20 resize-none focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 leading-relaxed font-semibold font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Category Selector</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full rounded-xl bg-white p-2.5 text-xs border focus:outline-none"
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
                    className="w-full rounded-xl bg-white p-2.5 text-xs border focus:outline-none"
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
                    className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border focus:outline-none text-slate-850"
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
                    className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border focus:outline-none text-slate-855"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1">Asset Cover graphic Image link</label>
                <input
                  type="text"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-xs border focus:outline-none text-slate-850"
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
          <div className="bg-white border rounded-3xl p-5 shadow-sm lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Inventory ({products.length} assets)</h3>
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {products.map(p => (
                <div key={p.id} className="flex gap-3 items-center border-b pb-3 border-slate-100 mt-1">
                  <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded bg-slate-50 border" />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="block font-bold text-slate-850 truncate">{p.name}</span>
                    <span className="block text-[9.5px] text-slate-400 font-mono">{p.category} • ₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BRANDING & CONTACT SETTINGS */}
      {activeTab === 'branding' && (
        <div id="website-setting-wrap" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="bg-white border rounded-3xl p-6 shadow-sm lg:col-span-7">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-1">
              <Settings className="h-4.5 w-4.5 text-blue-600" /> Branding & Contact parameters
            </h3>

            <form onSubmit={handleUpdateBranding} className="space-y-4 text-xs font-bold text-slate-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Company / Website Name</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Slogan Tagline</label>
                  <input
                    type="text"
                    required
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1">Site Meta Description</label>
                <textarea
                  required
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border p-2.5 h-16 resize-none text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Header Logo URL</label>
                  <input
                    type="text"
                    required
                    value={brandLogo}
                    onChange={(e) => setBrandLogo(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Footer Logo URL</label>
                  <input
                    type="text"
                    required
                    value={brandFooterLogo}
                    onChange={(e) => setBrandFooterLogo(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Favcon (Icon) URL</label>
                  <input
                    type="text"
                    required
                    value={brandFavicon}
                    onChange={(e) => setBrandFavicon(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Support Contact Email</label>
                  <input
                    type="email"
                    required
                    value={brandEmail}
                    onChange={(e) => setBrandEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Corporate Phone</label>
                  <input
                    type="text"
                    value={brandPhone}
                    onChange={(e) => setBrandPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">WhatsApp Tunnel</label>
                  <input
                    type="text"
                    value={brandWhatsapp}
                    onChange={(e) => setBrandWhatsapp(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-855"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Office Address</label>
                  <input
                    type="text"
                    value={brandAddress}
                    onChange={(e) => setBrandAddress(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-850"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 hover:bg-black py-3 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1 transition"
              >
                <Check className="h-4 w-4" /> Save Website Configurations
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Sales commission adjustments */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Smartphone className="h-4.5 w-4.5 text-blue-600" /> Affiliate baseline rate
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Universal Commission Percentage (%)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionRateVal}
                      onChange={(e) => setCommissionRateVal(e.target.value)}
                      className="rounded-xl bg-slate-50 px-3.5 py-2.5 border w-24 text-xs font-mono font-bold text-slate-800"
                    />
                    <button
                      onClick={saveCommissionSetting}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs cursor-pointer active:scale-95 transition"
                    >
                      Update Rates
                    </button>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-450 leading-relaxed bg-slate-50 p-3 rounded-xl border font-medium">
                  System warning: modifying active universal coefficients recalibrates current KYC and wallet withdrawal metrics instantaneously in the background.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CUSTOM PAGE BUILDER (DYNAMIC LAYOUT CREATOR) */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Dynamic Page Builder</h3>
              <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-semibold">Publish landing copies, terms, or about pages dynamically.</p>
            </div>
            <button
              onClick={() => setShowPageForm(!showPageForm)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-xs text-white py-2.5 px-4 flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Layout className="h-4.5 w-4.5" />
              <span>{showPageForm ? 'Review Catalog' : 'Add Custom Page'}</span>
            </button>
          </div>

          {/* New Page Form */}
          {showPageForm ? (
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Draft Custom Page</h3>
              
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
                      className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Public URL Path Slug</label>
                    <div className="flex items-center bg-slate-50 rounded-xl border px-3">
                      <span className="text-[10.5px] text-slate-400 font-mono select-none">/p/</span>
                      <input
                        type="text"
                        required
                        placeholder="terms-agreement"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                        className="bg-transparent border-none py-2.5 pl-1 text-slate-800 focus:outline-none w-full font-mono text-[10.5px]"
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
                      className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider mb-1">Template Aesthetic Layout</label>
                    <select
                      value={pageTemplate}
                      onChange={(e) => setPageTemplate(e.target.value)}
                      className="w-full rounded-xl bg-white border p-2.5 text-slate-800 focus:outline-none"
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
                    className="w-full rounded-xl bg-slate-50 border p-2.5 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Interactive Page Content (HTML & Markdown friendly)</label>
                  <textarea
                    required
                    placeholder="<h1>Dynamic Agreement</h1><p>Introduce content blocks here...</p>"
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border p-3 h-52 resize-none text-slate-800 font-mono text-[10.5px] leading-relaxed leading-snug font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border">
                  <div className="flex gap-2">
                    <span className="text-[10px] text-slate-450 uppercase font-black tracking-wide">Publish Status:</span>
                    <select
                      value={pageStatus}
                      onChange={(e) => setPageStatus(e.target.value as any)}
                      className="bg-white border rounded text-[10px] px-1 font-bold outline-none"
                    >
                      <option value="Published">Published (Live instantly)</option>
                      <option value="Draft">Draft Save (Private)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPageForm(false)} className="px-4 py-2 border rounded-lg bg-white hover:bg-slate-50 text-slate-500 font-bold">Cancel</button>
                    <button type="submit" className="px-4.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center gap-1 shadow-sm"><Check className="h-4 w-4" /> Publish Page</button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Pages catalog list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customPages.map(page => (
                <div key={page.id} className="group bg-white rounded-3xl p-5 border shadow-sm flex flex-col justify-between hover:border-slate-350 transition duration-150">
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[9px] uppercase px-2.5 py-1">
                        /p/{page.slug}
                      </span>

                      <span className={`rounded-xl px-2 py-0.5 text-[9px] font-extrabold uppercase border ${
                        page.status === 'Published' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                          : 'bg-slate-100 text-slate-400 border-slate-150'
                      }`}>
                        {page.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{page.title}</h4>
                    <p className="text-[10.5px] text-slate-400 mt-1 lines-clamp-3 block font-semibold">{page.seo_description || 'No meta index description loaded.'}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center shrink-0">
                    <span className="text-[9.5px] text-slate-400 font-mono">Template: {page.template}</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteCustomPage(page.slug)}
                        className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-650 flex items-center justify-center border transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {customPages.length === 0 && (
                <div className="md:col-span-2 text-center py-10 bg-white border rounded-2xl text-slate-400 font-bold">
                  No dynamic pages found. Click "Add Custom Page" to create.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
