"use client";

import React, { useState } from 'react';
import { Lock, Plus, Check, X, Settings } from 'lucide-react';
import { Profile, Product, KYCRequest, WithdrawRequest, SiteSettings } from '../types';

interface AdminConsoleProps {
  users: Profile[];
  products: Product[];
  kycRequests: KYCRequest[];
  withdrawRequests: WithdrawRequest[];
  siteSettings: SiteSettings;
  onApproveKYC: (userId: string) => void;
  onRejectKYC: (userId: string) => void;
  onApproveWithdrawal: (reqId: string) => void;
  onAddProduct: (prod: Product) => void;
  onChangeCommission: (rate: number) => void;
  activeSubTab?: 'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings';
  onSubTabChange?: (tab: 'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings') => void;
}

export default function AdminConsole({
  users,
  products,
  kycRequests,
  withdrawRequests,
  siteSettings,
  onApproveKYC,
  onRejectKYC,
  onApproveWithdrawal,
  onAddProduct,
  onChangeCommission,
  activeSubTab,
  onSubTabChange
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'kyc' | 'shop' | 'settings'>('stats');

  const rawTab = activeSubTab !== undefined ? activeSubTab : activeTab;
  const currentTab = (rawTab === 'branding' || rawTab === 'pages') ? 'settings' : rawTab;
  const setCurrentTab = onSubTabChange !== undefined ? onSubTabChange : setActiveTab;

  // New product form
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdImg, setNewProdImg] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
  const [newProdPrice, setNewProdPrice] = useState<string>('299');
  const [newProdCategory, setNewProdCategory] = useState<string>('E-Books');
  const [newProdType, setNewProdType] = useState<'digital_download' | 'affiliate_product'>('digital_download');
  const [newProdUrl, setNewProdUrl] = useState<string>('https://sugora.com/downloads/premium-file.zip');
  const [newProdAffUrl, setNewProdAffUrl] = useState<string>('');

  const [commissionRateVal, setCommissionRateVal] = useState<string>(siteSettings.commission_rate.toString());

  // Calculations for Stats tab
  const totalFinancialVolume = withdrawRequests
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdPrice) {
      alert('Fill standard required fields!');
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
    alert('Digital product successfully integrated into live Marketplace!');
    setNewProdName('');
    setNewProdDesc('');
  };

  const saveCommissionSetting = () => {
    const rate = parseFloat(commissionRateVal);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      onChangeCommission(rate);
      alert(`Settings changed: default affiliate rate set to ${rate}%`);
    }
  };

  return (
    <div id="admin-management-wrap" className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-50 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Lock className="h-6 w-6 text-emerald-600" />
            Sugora Global Administrator Console
          </h1>
          <p className="text-xs text-gray-500">
            Secure administrative control deck. Approve KYC verifications, disperse withdrawal audits, and append shop inventories.
          </p>
        </div>

        {/* Tab switcher */}
        {!activeSubTab && (
          <div className="flex flex-wrap gap-1.5 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
            {(['stats', 'users', 'kyc', 'shop', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  currentTab === tab
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STATS OVERVIEW PANEL */}
      {currentTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-gray-400">Database Registered Users</span>
              <h3 className="text-2xl font-bold font-mono text-gray-900 dark:text-zinc-100 mt-2">{users.length} Users</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-gray-400">Digital Store Directory</span>
              <h3 className="text-2xl font-bold font-mono text-gray-900 dark:text-zinc-100 mt-2">{products.length} Products</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Approved Cashouts</span>
              <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-2">₹{totalFinancialVolume.toFixed(2)}</h3>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-gray-400">Pending KYC Audits</span>
              <h3 className="text-2xl font-bold font-mono text-amber-500 mt-2">
                {kycRequests.filter(r => r.status === 'pending').length} Requests
              </h3>
            </div>
          </div>

          {/* Table representing pending cashout distributions */}
          <div className="rounded-2xl border bg-white p-5 shadow-xs dark:bg-zinc-900 dark:border-zinc-800/80">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Pending Wallet Transfer Requests</h3>
            {withdrawRequests.filter(r => r.status === 'pending').length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No cashout audits are outstanding.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-gray-50 text-gray-700 dark:bg-zinc-800/50 dark:text-zinc-300 uppercase">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Beneficiary Account</th>
                      <th className="p-3">Cash Sum</th>
                      <th className="p-3 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {withdrawRequests.filter(r => r.status === 'pending').map(req => (
                      <tr key={req.id}>
                        <td className="p-3 font-semibold text-gray-900 dark:text-zinc-200">@{req.username}</td>
                        <td className="p-3 text-gray-500">{req.method}</td>
                        <td className="p-3 font-mono">{req.details}</td>
                        <td className="p-3 font-bold text-red-650">₹{req.amount}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onApproveWithdrawal(req.id)}
                            className="bg-emerald-600 font-semibold px-2.5 py-1 text-white rounded text-[10px]"
                          >
                            Approve
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

      {/* USERS ACCOUNT LIST TAB */}
      {currentTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Platform Database Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 dark:bg-zinc-800/50 dark:text-zinc-300 uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Verified Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-500">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-3 font-bold text-gray-900 dark:text-zinc-200">{u.name}</td>
                    <td className="p-3 font-mono">@{u.username}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        u.is_verified ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'
                      }`}>
                        {u.is_verified ? 'Verified Creator' : 'Standard'}
                      </span>
                    </td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC COMPLIANCE MANAGE TAB */}
      {currentTab === 'kyc' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Compliance KYC Verification Board</h3>
          {kycRequests.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">All identity requests have been fully processed.</p>
          ) : (
            <div className="space-y-4">
              {kycRequests.map(req => (
                <div key={req.id} className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-zinc-100">{req.full_name}</span>
                      <span className="font-mono text-xs text-gray-400">(@{req.username})</span>
                    </div>
                    <div className="text-[11px] text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1 max-w-sm font-mono leading-relaxed">
                      <span>PAN: {req.pan_card}</span>
                      <span>Aadhaar: {req.aadhaar_card}</span>
                      <span className="col-span-2">Address: {req.address}</span>
                    </div>
                    <div>
                      <span className={`inline-block text-[10px] font-bold uppercase ${
                        req.status === 'pending' ? 'text-amber-500' : req.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        Status: {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRejectKYC(req.id)}
                        className="rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 px-3 py-2 text-xs font-bold transition flex items-center gap-1 dark:bg-zinc-900 dark:border-rose-950 dark:text-rose-400"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApproveKYC(req.id)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHOP MANAGEMENT TAB */}
      {currentTab === 'shop' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Append product form */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1 mb-4">
              + Append Marketplace Product
            </h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tiktok Marketing Handbook"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Catalog Description</label>
                <textarea
                  required
                  placeholder="Insert fully-detailed descriptions here..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Section Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-950 p-2 border border-gray-100 dark:border-zinc-800"
                  >
                    <option value="E-Books">E-Books</option>
                    <option value="Design Templates">Design Templates</option>
                    <option value="Affiliate Services">Affiliate Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Inventory Mode</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as any)}
                    className="w-full rounded bg-white dark:bg-zinc-950 p-2 border border-gray-100 dark:border-zinc-800"
                  >
                    <option value="digital_download">Direct Digital File</option>
                    <option value="affiliate_product">External Affiliate Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Mock Image Link</label>
                  <input
                    type="text"
                    value={newProdImg}
                    onChange={(e) => setNewProdImg(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>
              </div>

              {newProdType === 'digital_download' ? (
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">Direct Download URL</label>
                  <input
                    type="text"
                    value={newProdUrl}
                    onChange={(e) => setNewProdUrl(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest font-bold mb-1">External Affiliate Redirect Link</label>
                  <input
                    type="text"
                    placeholder="https://affiliate.com/referral-id"
                    value={newProdAffUrl}
                    onChange={(e) => setNewProdAffUrl(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm"
              >
                Assemble New Product Link
              </button>
            </form>
          </div>

          {/* Current catalog preview */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Direct Store Showcase ({products.length} Items)</h3>
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto">
              {products.map(p => (
                <div key={p.id} className="flex gap-3 items-center border-b pb-3 border-gray-50 dark:border-zinc-800/20">
                  <img referrerPolicy="no-referrer" src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded bg-zinc-100" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs truncate text-gray-900 dark:text-zinc-101">{p.name}</span>
                    <span className="block text-[10px] text-gray-400 capitalize">{p.category} • ₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CORE COMMISSION SETTINGS TAB */}
      {currentTab === 'settings' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs max-w-md">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5" /> Commission Allocation Engine
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Affiliate Sales Commission Rate (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRateVal}
                  onChange={(e) => setCommissionRateVal(e.target.value)}
                  className="rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2 border border-gray-100 dark:border-zinc-800 w-24 text-xs font-mono font-bold"
                />
                <button
                  onClick={saveCommissionSetting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs"
                >
                  Apply rates
                </button>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40">
              System notice: modifying the commission allocation targets rewards real-time affiliate transfers for subsequent marketplace checkouts dynamically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
