/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, ShieldCheck, DollarSign, Download, Share2, Award, ArrowUpRight, TrendingUp, Clock, AlertCircle } from 'lucide-react';
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

  // Sum earnings
  const affiliateEarnings = transactions
    .filter(t => t.type === 'affiliate_earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const referralEarnings = transactions
    .filter(t => t.type === 'referral_earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarnings = wallet.balance + wallet.withdrawn;

  return (
    <div id="user-dashboard-root" className="space-y-6">
      {/* Visual Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 dark:bg-[#07090d] border border-zinc-200/50 dark:border-zinc-800/80 p-6 text-zinc-100 shadow-xl md:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 backdrop-blur-xs">
              <Award className="h-3 w-3 text-emerald-400" /> Member Profile
            </span>
            <h1 className="mt-3.5 text-2xl font-bold tracking-tight md:text-3xl text-white">
              Namaste, {profile.name}!
            </h1>
            <p className="mt-1.5 text-zinc-400 max-w-xl text-xs md:text-sm leading-relaxed">
              Manage your Sugora Tree link builder, digital shop orders, real-time chats, and affiliate income payouts here.
            </p>
          </div>
          <button
            id="builder-shortcut-btn"
            onClick={() => onNavigate('tree')}
            className="self-start md:self-center flex items-center gap-2 rounded-xl bg-white text-zinc-950 px-5 py-3 text-xs font-bold transition hover:bg-zinc-100 active:scale-95 shadow-md cursor-pointer border border-zinc-205"
          >
            Customize Sugora Tree
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* KYC Alert banner */}
      {kycStatus === 'unsubmitted' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-800 dark:border-amber-900/35 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Identity Verification Required</h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-400">
              Submit your PAN & Aadhaar details under the Wallet & KYC tab to enable secure bank withdrawals.
            </p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Verify Now
          </button>
        </div>
      )}
      {kycStatus === 'pending' && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-800 dark:border-blue-900/35 dark:bg-blue-950/20 dark:text-blue-300">
          <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
          <div>
            <h4 className="font-semibold text-sm">KYC Verifications in Progress</h4>
            <p className="text-xs text-blue-700/90 dark:text-blue-400">
              Our support operators are reviewing your submission. Approvals usually take under 2 hours.
            </p>
          </div>
        </div>
      )}

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Wallet Balance widget */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800/40 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Wallet Balance</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                ₹{wallet.balance.toFixed(2)} Main
              </span>
              <span>•</span>
              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400">
                ₹{wallet.promo_balance.toFixed(2)} Welcome Bonus
              </span>
            </div>
          </div>
        </div>

        {/* Affiliate Income widget */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800/40 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Affiliate Income</span>
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Share2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              ₹{affiliateEarnings.toFixed(2)}
            </h3>
            <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Commission rate 10% on direct purchases
            </p>
          </div>
        </div>

        {/* Referrals widget */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800/40 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Referral Income</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              ₹{referralEarnings.toFixed(2)}
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
              Code: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">{referralCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistics and Visual Microcharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800/40 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Commission Growth Insights</h2>
            <span className="text-xs text-gray-400">Recent 7 Days</span>
          </div>
          
          <div className="mt-6 flex h-48 items-end gap-3 px-2">
            {[45, 60, 52, 78, 65, 88, 110].map((val, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2 group cursor-pointer">
                <span className="scale-0 group-hover:scale-100 transition absolute -translate-y-8 bg-zinc-800 text-white rounded px-1.5 py-0.5 text-[10px] font-semibold">
                  ₹{val * 10}
                </span>
                <div 
                  style={{ height: `${val}%` }}
                  className="w-full rounded-md bg-gradient-to-t from-teal-500 to-emerald-600 opacity-85 transition group-hover:opacity-100 shadow-sm"
                ></div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {['29 May', '30 May', '31 May', '01 Jun', '02 Jun', '03 Jun', 'Today'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini totals box */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800/40 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Marketplace Totals</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Downloads</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">12 Files</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-950/30">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Purchases</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">₹{totalEarnings.toFixed(2)} Volume</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800">
            <button 
              onClick={() => onNavigate('shop')}
              className="w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 py-2.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition"
            >
              Browse Shop Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800/40 dark:bg-zinc-900">
        <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Recent Wallet Activity</h2>
        
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-gray-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-gray-400">No account actions documented yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-zinc-200">{tx.description}</div>
                      <div className="text-[10px] font-mono text-gray-400">{tx.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        tx.type === 'deposit' || tx.type === 'admin_reward'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : tx.type === 'withdrawal'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      tx.type === 'withdrawal' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
