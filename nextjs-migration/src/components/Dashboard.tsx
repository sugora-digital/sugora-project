/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, ShieldCheck, DollarSign, Download, Share2, Award, 
  ArrowUpRight, TrendingUp, Clock, AlertCircle, Copy, Check 
} from 'lucide-react';
import { Profile, Wallet as WalletType, WalletTransaction } from '../types';

interface DashboardProps {
  profile: Profile;
  wallet: WalletType;
  transactions: WalletTransaction[];
  referralCode: string;
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  onNavigate: (view: string) => void;
}

export default function Dashboard({
  profile,
  wallet,
  transactions,
  referralCode,
  kycStatus,
  onNavigate
}: DashboardProps) {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sum earnings
  const affiliateEarnings = transactions
    .filter(t => t.type === 'affiliate_earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const referralEarnings = transactions
    .filter(t => t.type === 'referral_earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarnings = wallet.balance + wallet.withdrawn;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://sugora.com/ref/${referralCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="user-dashboard-wrapper" className="space-y-6 bg-slate-50/20 dark:bg-zinc-950/20 p-1 md:p-4 rounded-3xl font-sans">
      
      {/* Welcome banner block */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border dark:border-zinc-800 p-6 text-white shadow-xl md:p-8 text-left">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="text-left font-sans">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 select-none">
              <Award className="h-3 w-3 text-yellow-300" /> Active Creator Account
            </span>
            <h1 className="mt-3.5 text-2xl font-black tracking-tight md:text-3xl">
              Hello, {profile.name}!
            </h1>
            <p className="mt-1.5 text-indigo-100 max-w-xl text-xs md:text-sm leading-relaxed">
              Build your custom Sugora Tree bio, showcase digital stores, trigger automated AI copywriting, and direct affiliate payouts!
            </p>
          </div>
          <button
            key="dashboard-tree-btn"
            type="button"
            onClick={() => onNavigate('tree')}
            className="self-start md:self-center flex items-center gap-1.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs px-5 py-3 shadow-md hover:bg-slate-50 transition active:scale-95 border-0 cursor-pointer shrink-0"
          >
            Customize Sugora Tree
            <ArrowUpRight className="h-4.5 w-4.5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* KYC Alert banners */}
      {kycStatus === 'unsubmitted' && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-5 text-amber-900 dark:text-amber-400 animate-fadeIn relative text-left font-sans">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-550 animate-pulse" />
          <div className="flex-1 text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">Approved KYC Identity Required</h4>
            <p className="text-amber-700 dark:text-amber-500 font-semibold leading-relaxed">
              Verify your Aadhaar & PAN scanning cards under the secure Wallet tab to enable secure UPI payout transfers.
            </p>
          </div>
          <button
            key="unsub-kyc-verify"
            type="button"
            onClick={() => onNavigate('wallet')}
            className="rounded-xl bg-amber-600 dark:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm shrink-0 whitespace-nowrap active:scale-95 border-0 cursor-pointer transition select-none"
          >
            Verify Now
          </button>
        </div>
      )}
      {kycStatus === 'pending' && (
        <div className="flex items-center gap-4 rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5 text-blue-905 dark:text-blue-400 animate-fadeIn text-left font-sans">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-550 animate-pulse" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-blue-950 dark:text-blue-300">Identity review in progress</h4>
            <p className="text-blue-700 dark:text-blue-500 leading-relaxed font-semibold">
              Our administration compliance team is reviewing Aadhaar parameters. Unlocks typically take 1-2 hours.
            </p>
          </div>
        </div>
      )}

      {/* Bento grid summary widgets */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* WALLET */}
        <div className="rounded-3xl border dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition duration-150 text-left font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Main Payout Wallet</span>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-2 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 select-none">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-zinc-200">
              ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
            </h3>
            <div className="mt-3.5 flex flex-wrap gap-1.5 text-[9.5px] font-bold uppercase text-slate-500 dark:text-zinc-440">
              <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 font-mono select-none">
                ₹{wallet.balance.toFixed(2)} cash
              </span>
              <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-indigo-805 dark:text-indigo-400 border border-indigo-105 dark:border-indigo-900/50 font-mono select-none">
                ₹{wallet.promo_balance.toFixed(2)} promo
              </span>
            </div>
          </div>
        </div>

        {/* AFFILIATE */}
        <div className="rounded-3xl border dark:border-zinc-805 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition duration-150 text-left font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Affiliate commission</span>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950 p-2 text-blue-700 dark:text-blue-400 border border-blue-105 dark:border-blue-900/40 select-none">
              <Share2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-zinc-200">
              ₹{affiliateEarnings.toFixed(2)}
            </h3>
            <span className="inline-flex items-center gap-1.5 mt-3 text-[10.5px] text-blue-600 dark:text-blue-400 font-extrabold select-none">
              <TrendingUp className="h-3.5 w-3.5" /> 10% on direct asset sales
            </span>
          </div>
        </div>

        {/* REFERRAL LINK SHARE */}
        <div className="rounded-3xl border dark:border-zinc-805 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition duration-150 sm:col-span-2 lg:col-span-1 text-left font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-505">Share & Earn Cashback</span>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950 p-2 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 select-none">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-0.2 w-full text-[1px]" />
            <div className="flex bg-slate-50 dark:bg-zinc-950 p-2 rounded-2xl border dark:border-zinc-800 items-center justify-between">
              <span className="font-mono text-[10.5px] font-bold text-slate-650 dark:text-zinc-350 truncate max-w-[150px]">
                sugora.com/ref/{referralCode}
              </span>
              <button
                key="share-copy-trigger"
                type="button"
                onClick={handleCopyCode}
                className="rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white font-extrabold text-[10.5px] px-3.5 py-2 flex items-center gap-1 transition shrink-0 border-0 cursor-pointer"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary sections: Quick task guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Creator roadmap checklist */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 p-5 shadow-sm space-y-4 text-left font-sans">
          <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-left">Creator Launchpad Steps</h4>
          
          <div className="space-y-3 text-xs leading-relaxed font-semibold">
            <div className="flex items-start gap-3 p-2 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border dark:border-zinc-800 border-dashed hover:bg-slate-50 dark:hover:bg-zinc-950 transition border-blue-200 dark:border-blue-900/40">
              <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 border dark:border-blue-900/50 select-none">1</span>
              <div>
                <span className="block text-slate-800 dark:text-zinc-200 font-bold">Configure Sugora Tree micro-bio</span>
                <span className="text-[10.5px] text-slate-450 dark:text-zinc-500 block font-sans">Setup display names, contact whatsapp numbers, and location regions.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border dark:border-zinc-800 border-dashed hover:bg-slate-50 dark:hover:bg-zinc-950 transition">
              <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 border dark:border-zinc-700 select-none">2</span>
              <div>
                <span className="block text-slate-700 dark:text-zinc-300 font-bold">Add checklist assets under inventory</span>
                <span className="text-[10.5px] text-slate-450 dark:text-zinc-500 block font-sans">Write descriptive digital handbooks and offer file downloads.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border dark:border-zinc-800 border-dashed hover:bg-slate-50 dark:hover:bg-zinc-950 transition">
              <span className="h-5 w-5 rounded-full bg-slate-205 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 border dark:border-zinc-700 select-none">3</span>
              <div>
                <span className="block text-slate-705 dark:text-zinc-300 font-bold">Disperse WhatsApp and Bio tags</span>
                <span className="text-[10.5px] text-slate-455 dark:text-zinc-500 block font-sans">Advertise your unique sugora.com/u/userName on social feeds.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger actions status */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 p-5 shadow-sm space-y-4 text-left font-sans">
          <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-left">Recent Transaction History</h4>
          
          <div className="space-y-3.5 max-h-[195px] overflow-y-auto pr-1">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-955 p-3 rounded-2xl border dark:border-zinc-800 text-xs">
                <div className="text-left font-sans">
                  <span className="block font-bold text-slate-850 dark:text-zinc-200">{tx.description}</span>
                  <span className="block text-[9.5px] text-slate-400 dark:text-zinc-500 font-mono capitalize">{tx.type} • {tx.status}</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-300">
                  +₹{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-550 py-6 text-center">No platform ledger entries recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
