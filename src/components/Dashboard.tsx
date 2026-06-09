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

  const totalEarnings = wallet.balance + wallet.withdrawn;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://sugora.com/ref/${referralCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="user-dashboard-wrapper" className="space-y-8 bg-[#F8FAFC]/55 dark:bg-[#06080a]/30 p-2 md:p-6 rounded-[32px]">
      
      {/* 1. VISUAL PREMIUM HERO COVER BANNER */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FF3366] via-[#7000FF] to-[#3300FF] p-6 text-white shadow-[0_20px_50px_rgba(112,0,255,0.25)] md:p-10 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(112,0,255,0.35)]">
        {/* Floating background glows and futuristic vector spheres */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-6w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -mb-16 h-48 w-48 rounded-full bg-[#00FFFF]/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-[#FF00FF]/25 rounded-full blur-2xl flex items-center justify-center animate-bounce duration-10000" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase backdrop-blur-md border border-white/25">
              <Award className="h-3.5 w-3.5 text-yellow-300 animate-spin" /> India's Most Advanced bio platform
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Prepare Smarter,<br />
              <span className="text-[#00FFFF]">Score Higher,</span><br />
              Achieve Your Dream!
            </h1>
            <p className="max-w-xl text-xs md:text-sm text-indigo-55 font-medium leading-relaxed opacity-90">
              Join 5,00,000+ creators building dynamic Sugora trees, launching customizable digital shops, running AI assistant managers, and scaling payout commissions securely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => onNavigate('tree')}
              className="px-6 py-4 rounded-2xl bg-[#00FFFF] text-slate-900 font-extrabold text-xs tracking-wider uppercase shadow-[0_10px_20px_rgba(0,255,255,0.2)] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-205 cursor-pointer flex items-center gap-2"
            >
              Start Practicing Now →
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-4 rounded-2xl bg-white/15 text-white font-extrabold text-xs tracking-wider uppercase border border-white/20 hover:bg-white/25 hover:scale-105 active:scale-95 transition-all duration-205 cursor-pointer"
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>

      {/* KYC Alert banners */}
      {kycStatus === 'unsubmitted' && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/80 p-5 text-amber-900 shadow-md">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 animate-bounce" />
          <div className="flex-1 text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-amber-950 uppercase tracking-wider">Approved KYC Identity Required</h4>
            <p className="text-amber-700 font-bold leading-relaxed">
              Verify your Aadhaar & PAN scanning cards under the secure Wallet tab to enable secure UPI payout transfers.
            </p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="rounded-2xl bg-[#FF3366] px-4 py-2.5 text-xs font-black text-white hover:bg-[#E02252] shadow-sm shrink-0 whitespace-nowrap active:scale-95 transition cursor-pointer"
          >
            Verify Now
          </button>
        </div>
      )}
      {kycStatus === 'pending' && (
        <div className="flex items-center gap-4 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/80 p-5 text-blue-900 shadow-md">
          <Clock className="h-6 w-6 text-blue-600 animate-pulse animate-spin" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">Identity Review In Progress</h4>
            <p className="text-blue-700 leading-relaxed font-semibold">
              Our administration compliance team is reviewing Aadhaar parameters. Unlocks typically take 1-2 hours.
            </p>
          </div>
        </div>
      )}

      {/* 2. DYNAMICAL STAT CARDS - THE "GOOD MORNING" INSPIRED COLOURED BLOCKS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* WALLET / BALANCES */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7000FF] to-[#A044FF] p-6 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-purple-100">Main Payout Wallet</span>
            <div className="rounded-2xl bg-white/15 p-2 text-white border border-white/20">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-4xl font-black font-mono tracking-tight">
              ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
            </h3>
            <div className="flex gap-2 text-[9.5px] font-black uppercase text-purple-100">
              <span className="rounded-lg bg-white/15 px-2 py-1 border border-white/10">
                ₹{wallet.balance.toFixed(2)} CASH
              </span>
              <span className="rounded-lg bg-[#00FFFF]/20 px-2 py-1 border border-[#00FFFF]/30 text-[#00FFFF]">
                ₹{wallet.promo_balance.toFixed(2)} PROMO
              </span>
            </div>
          </div>
        </div>

        {/* COMMISSION WITH DUAL TREND */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3300FF] via-[#0055FF] to-[#0099FF] p-6 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-100">Total Income Volume</span>
            <div className="rounded-2xl bg-white/15 p-2 text-white border border-white/20">
              <Share2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-4xl font-black font-mono tracking-tight">
              ₹{totalEarnings.toFixed(2)}
            </h3>
            <div className="flex items-center gap-1.5 text-[10.5px] text-[#00FFFF] font-extrabold uppercase">
              <TrendingUp className="h-4 w-4" /> 10% on direct asset sales
            </div>
          </div>
        </div>

        {/* UPI REFERRAL LINK CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9900] to-[#FF5E00] p-6 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-orange-100">Refer & Earn Cashback</span>
            <div className="rounded-2xl bg-white/15 p-2 text-white border border-white/20">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-[11px] text-orange-50 font-medium">Claim ₹100 instant bonus reward on every joined invite.</p>
            <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/20 items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold text-yellow-105 truncate max-w-[140px] pl-2">
                sugora.com/ref/{referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="rounded-xl bg-white text-orange-950 font-black text-[10px] px-3 py-2 flex items-center gap-1 transition shrink-0 cursor-pointer shadow-md hover:bg-orange-50 active:scale-95"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-orange-600" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "EXPLORE BY SUBJECT" SECTIONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Explore by Subject</h2>
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1 text-[11px] font-bold border">
            <span className="bg-white text-slate-800 px-3 py-1 rounded-lg shadow-sm">NEET UG</span>
            <span className="text-slate-500 px-3 py-1 hover:text-slate-800 cursor-pointer">JEE MAIN</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SUBJECT 1: Biology Class 11 */}
          <div className="rounded-3xl border border-[#D1F2E5] bg-[#E8F8F2] p-6 shadow-sm transition hover:shadow-md hover:scale-[1.01] space-y-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div>
                <span className="text-[#0D9488] font-extrabold text-xs uppercase tracking-wider block">Biology</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">Class 11</span>
              </div>
              <div className="bg-[#D1F2E5] text-[#0D9488] font-black text-[10px] px-2.5 py-1 rounded-xl self-start">
                68% Progress
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-black text-slate-800 font-mono">12,450</span>
                <span className="text-[10px] text-slate-405 block font-bold uppercase">Questions</span>
              </div>
              {/* Custom micro SVG progress circle */}
              <div className="h-12 w-12 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#D1F5E5" strokeWidth="3" />
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#0D9488" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.68)}`} />
                </svg>
                <span className="absolute text-[10px] font-extrabold font-mono text-[#0D9488]">68%</span>
              </div>
            </div>
          </div>

          {/* SUBJECT 2: Biology Class 12 */}
          <div className="rounded-3xl border border-[#DCE4FF] bg-[#EDF3FF] p-6 shadow-sm transition hover:shadow-md hover:scale-[1.01] space-y-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div>
                <span className="text-[#2563EB] font-extrabold text-xs uppercase tracking-wider block">Biology</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">Class 12</span>
              </div>
              <div className="bg-[#DCE4FF] text-[#2563EB] font-black text-[10px] px-2.5 py-1 rounded-xl self-start">
                72% Progress
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-black text-slate-800 font-mono">15,230</span>
                <span className="text-[10px] text-slate-440 block font-bold uppercase">Questions</span>
              </div>
              <div className="h-12 w-12 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#E2E7FF" strokeWidth="3" />
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#2563EB" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.72)}`} />
                </svg>
                <span className="absolute text-[10px] font-extrabold font-mono text-[#2563EB]">72%</span>
              </div>
            </div>
          </div>

          {/* SUBJECT 3: Physics Class 11 */}
          <div className="rounded-3xl border border-[#E9D5FF] bg-[#F3E8FF] p-6 shadow-sm transition hover:shadow-md hover:scale-[1.01] space-y-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div>
                <span className="text-[#7C3AED] font-extrabold text-xs uppercase tracking-wider block">Physics</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">Class 11</span>
              </div>
              <div className="bg-[#E9D5FF] text-[#7C3AED] font-black text-[10px] px-2.5 py-1 rounded-xl self-start">
                65% Progress
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-black text-slate-800 font-mono">10,420</span>
                <span className="text-[10px] text-slate-440 block font-bold uppercase">Questions</span>
              </div>
              <div className="h-12 w-12 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#F5EEFF" strokeWidth="3" />
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#7C3AED" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.65)}`} />
                </svg>
                <span className="absolute text-[10px] font-extrabold font-mono text-[#7C3AED]">65%</span>
              </div>
            </div>
          </div>

          {/* SUBJECT 4: Physics Class 12 */}
          <div className="rounded-3xl border border-[#FDE2E4] bg-[#FFEBEF] p-6 shadow-sm transition hover:shadow-md hover:scale-[1.01] space-y-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div>
                <span className="text-[#E11D48] font-extrabold text-xs uppercase tracking-wider block">Physics</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">Class 12</span>
              </div>
              <div className="bg-[#FDE2E4] text-[#E11D48] font-black text-[10px] px-2.5 py-1 rounded-xl self-start">
                71% Progress
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-black text-slate-800 font-mono">14,300</span>
                <span className="text-[10px] text-slate-440 block font-bold uppercase">Questions</span>
              </div>
              <div className="h-12 w-12 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#FFE3E7" strokeWidth="3" />
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="#E11D48" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.71)}`} />
                </svg>
                <span className="absolute text-[10px] font-extrabold font-mono text-[#E11D48]">71%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. "TOP RANKERS OF THE MONTH" BOTTOM STRIP ROW */}
      <div className="rounded-[32px] bg-gradient-to-r from-[#170E43] via-[#10072B] to-[#120038] p-6 md:p-8 text-white shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold font-mono text-lg">👑</span>
            <h3 className="font-extrabold text-base md:text-lg tracking-wide uppercase">Top Rankers of the Month</h3>
          </div>
          <button onClick={() => onNavigate('chat')} className="text-xs font-black text-purple-300 hover:text-white uppercase transition cursor-pointer">
            View Leaderboard &gt;
          </button>
        </div>

        {/* Rankers profiles list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Ranker 1 */}
          <div className="flex items-center gap-3.5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all duration-150">
            <div className="relative shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" alt="Rahul Sharma" className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 text-slate-905 font-black text-[10px] rounded-full flex items-center justify-center shadow-md">1</span>
            </div>
            <div className="text-xs truncate">
              <span className="block font-black text-white leading-tight">Rahul Sharma</span>
              <span className="block text-[10px] text-yellow-350 font-bold mt-0.5">NEET UG</span>
              <span className="block text-[9px] font-extrabold font-mono text-[#00FFFF]">720/720</span>
            </div>
          </div>

          {/* Ranker 2 */}
          <div className="flex items-center gap-3.5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all duration-150">
            <div className="relative shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Ananya Singh" className="w-11 h-11 rounded-full object-cover border-2 border-slate-300" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-slate-300 text-slate-905 font-black text-[10px] rounded-full flex items-center justify-center shadow-md">2</span>
            </div>
            <div className="text-xs truncate">
              <span className="block font-black text-white leading-tight">Ananya Singh</span>
              <span className="block text-[10px] text-slate-350 font-bold mt-0.5">NEET UG</span>
              <span className="block text-[9px] font-extrabold font-mono text-[#00FFFF]">719/720</span>
            </div>
          </div>

          {/* Ranker 3 */}
          <div className="flex items-center gap-3.5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all duration-150">
            <div className="relative shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Vivek Kumar" className="w-11 h-11 rounded-full object-cover border-2 border-amber-600" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-amber-600 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md">3</span>
            </div>
            <div className="text-xs truncate">
              <span className="block font-black text-white leading-tight">Vivek Kumar</span>
              <span className="block text-[10px] text-orange-350 font-bold mt-0.5">JEE Main</span>
              <span className="block text-[9px] font-extrabold font-mono text-[#00FFFF]">100 %ile</span>
            </div>
          </div>

          {/* Ranker 4 */}
          <div className="flex items-center gap-3.5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all duration-150">
            <div className="relative shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" alt="Pooja Mehta" className="w-11 h-11 rounded-full object-cover border-2 border-white/5" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-white/10 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-md">4</span>
            </div>
            <div className="text-xs truncate">
              <span className="block font-black text-white leading-tight">Pooja Mehta</span>
              <span className="block text-[10px] text-purple-350 font-bold mt-0.5">NEET UG</span>
              <span className="block text-[9px] font-extrabold font-mono text-[#00FFFF]">718/720</span>
            </div>
          </div>

          {/* Ranker 5 */}
          <div className="flex items-center gap-3.5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all duration-150">
            <div className="relative shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" alt="Arjun Patel" className="w-11 h-11 rounded-full object-cover border-2 border-white/5" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-white/10 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-md">5</span>
            </div>
            <div className="text-xs truncate">
              <span className="block font-black text-white leading-tight">Arjun Patel</span>
              <span className="block text-[10px] text-cyan-350 font-bold mt-0.5">JEE Main</span>
              <span className="block text-[9px] font-extrabold font-mono text-[#00FFFF]">99.98 %ile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary sections: Quick task guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Creator roadmap checklist */}
        <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Creator Launchpad Steps</h4>
          
          <div className="space-y-3 text-xs leading-relaxed font-semibold">
            <div className="flex items-start gap-4 p-3 bg-slate-50/50 rounded-2xl border border-dashed hover:bg-indigo-50/30 transition border-indigo-200">
              <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">1</span>
              <div>
                <span className="block text-slate-800 font-bold">Configure Sugora Tree micro-bio</span>
                <span className="text-[10.5px] text-slate-450 block">Setup display names, contact whatsapp numbers, and location regions.</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-slate-50/50 rounded-2xl border border-dashed hover:bg-emerald-50/30 transition border-transparent">
              <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">2</span>
              <div>
                <span className="block text-slate-700">Add checklist assets under inventory</span>
                <span className="text-[10.5px] text-slate-450 block">Write descriptive digital handbooks and offer file downloads.</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-slate-50/50 rounded-2xl border border-dashed hover:bg-amber-50/20 transition border-transparent">
              <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">3</span>
              <div>
                <span className="block text-slate-700">Disperse WhatsApp and Bio tags</span>
                <span className="text-[10.5px] text-slate-450 block">Advertise your unique sugora.com/u/userName on social feeds.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger actions status */}
        <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recent Transaction History</h4>
          
          <div className="space-y-3.5 max-h-[195px] overflow-y-auto pr-1">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="block font-bold text-slate-800">{tx.description}</span>
                  <span className="block text-[9.5px] text-slate-400 font-mono capitalize">{tx.type} • {tx.status}</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-600">
                  +₹{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No platform ledger entries recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
