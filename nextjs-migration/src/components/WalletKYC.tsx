/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, Landmark, QrCode, CreditCard, ChevronRight, CheckCircle, 
  ShieldAlert, AlertCircle, FileText, Camera, Check 
} from 'lucide-react';
import { Profile, Wallet as WalletType, WalletTransaction } from '../types';

interface WalletKYCProps {
  currentUser: Profile;
  wallet: WalletType;
  transactions: WalletTransaction[];
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  onAddFunds: (amount: number) => void;
  onWithdrawFunds: (amount: number, method: 'UPI' | 'Bank Transfer', details: string) => Promise<boolean> | boolean | null;
  onSubmitKYC: (fullName: string, dob: string, address: string, pan: string, aadhaar: string) => void;
}

export default function WalletKYC({
  currentUser,
  wallet,
  transactions,
  kycStatus,
  onAddFunds,
  onWithdrawFunds,
  onSubmitKYC
}: WalletKYCProps) {
  // Wallet modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addAmount, setAddAmount] = useState<string>('500');
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState<string>('');

  // KYC form
  const [kycFullName, setKycFullName] = useState<string>('');
  const [kycDob, setKycDob] = useState<string>('2000-01-01');
  const [kycAddress, setKycAddress] = useState<string>('');
  const [kycPan, setKycPan] = useState<string>('');
  const [kycAadhaar, setKycAadhaar] = useState<string>('');

  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const executeAddFunds = () => {
    const amt = parseFloat(addAmount);
    if (!isNaN(amt) && amt > 0) {
      onAddFunds(amt);
      setShowAddModal(false);
      setAddAmount('500');
    }
  };

  const executeWithdrawFunds = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (kycStatus !== 'approved') {
      setWithdrawStatus('Withdrawal block: approved KYC identity check is mandatory!');
      return;
    }

    if (amt > wallet.balance) {
      setWithdrawStatus('Insufficient wallet ledger balance!');
      return;
    }

    if (!withdrawDetails.trim()) {
      setWithdrawStatus('Recipient payment address details is mandatory!');
      return;
    }

    const success = await onWithdrawFunds(amt, withdrawMethod, withdrawDetails);
    if (success) {
      setShowWithdrawModal(false);
      setWithdrawAmount('100');
      setWithdrawDetails('');
      setWithdrawStatus(null);
    }
  };

  const handleKYCFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName || !kycAddress || !kycPan || !kycAadhaar) {
      alert('All fields are mandatory!');
      return;
    }
    onSubmitKYC(kycFullName, kycDob, kycAddress, kycPan, kycAadhaar);
  };

  return (
    <div id="wallet-kyc-main-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/20 dark:bg-zinc-955/20 p-1 md:p-4 rounded-3xl animate-fadeIn font-sans">
      
      {/* LEFT COLUMN: ACTIVE WALLET LEDGER ACTIONS */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Visa Glassmorphic wallet card */}
        <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-white/10 blur-2xl font-sans" />
          
          <div className="flex justify-between items-start">
            <div className="font-sans">
              <span className="text-[10px] uppercase font-stone tracking-[0.15em] text-indigo-200">Sugora Pay Cash Vault</span>
              <h2 className="text-3xl font-black font-mono tracking-tight mt-1.5">
                ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
              </h2>
            </div>
            <span className="rounded bg-white/15 text-[9px] font-black uppercase px-2.5 py-1 border border-white/25 select-none">
              Secure Ledger
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 font-sans">
            <div>
              <span className="block text-[9.5px] text-indigo-200 uppercase font-bold text-left">Main Cash balance</span>
              <span className="text-sm font-black font-mono text-left">₹{wallet.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[9.5px] text-indigo-200 uppercase font-bold text-left">Promo Sign-up Cash</span>
              <span className="text-sm font-black font-mono text-left">₹{wallet.promo_balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-white/15">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex-1 rounded-xl bg-white text-indigo-900 py-3 text-xs font-black hover:bg-slate-50 transition active:scale-95 shadow-md cursor-pointer border-0 select-none"
            >
              Add Funds
            </button>
            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 rounded-xl bg-white/15 text-white py-3 text-xs font-black hover:bg-white/20 transition active:scale-95 border border-white/20 cursor-pointer select-none"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Ledger logs */}
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 text-left">
          <h3 className="text-xs font-bold text-slate-750 dark:text-zinc-200 uppercase tracking-wider text-left">Historical Wallet Statements</h3>
          <div className="space-y-3 max-h-[295px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-105 border dark:border-zinc-805 rounded-2xl flex justify-between items-center text-xs transition duration-100">
                <div className="text-left font-sans">
                  <span className="block font-bold text-slate-800 dark:text-zinc-200">{tx.description}</span>
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500 capitalize font-medium">{tx.type} • {tx.status}</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-bold text-slate-850 dark:text-zinc-350">₹{tx.amount.toFixed(2)}</span>
                  <span className="block text-[9px] text-slate-400 dark:text-zinc-505 font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-550 py-6 text-center">No wallet activity logs recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: KYC STATUS COMPLIANCE FORM */}
      <div className="lg:col-span-6">
        
        {kycStatus === 'approved' ? (
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-center space-y-4 font-sans">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="font-sans text-center">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-150">Compliance Verification Granted</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-440 mt-1 leading-relaxed font-semibold">Your Aadhaar and PAN check is completely confirmed. Bank payouts enabled.</p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-zinc-955 border dark:border-zinc-800 rounded-2xl text-left text-xs font-bold font-mono text-slate-500 space-y-1.5 leading-normal">
              <div className="flex justify-between">
                <span>Verification ID</span>
                <span className="text-slate-800 dark:text-zinc-200 font-bold">SUG-KYC-CONFIRMED</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-450">ACTIVE CREATOR</span>
              </div>
            </div>
          </div>
        ) : kycStatus === 'pending' ? (
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-3xl p-6 shadow-sm text-center space-y-4 font-sans">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-105 dark:border-blue-900/40 animate-pulse animate-none">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="text-center font-sans">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-200">Verification in progress</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-440 mt-1 leading-relaxed font-semibold">Document credentials are being evaluated by our Support agents. High priority checklist!</p>
            </div>
          </div>
        ) : (
          /* KYC Verification Form */
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 text-left font-sans">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 text-left">
                <FileText className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" /> Identity KYC verification Form
              </h3>
              <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed font-semibold">
                By reserve policy framework, upload Aadhaar & PAN numbers for instant wallet payout activation.
              </p>
            </div>

            <form onSubmit={handleKYCFormSubmit} className="space-y-4 text-xs font-bold text-slate-505 dark:text-zinc-400 text-left leading-relaxed">
              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1.5">Full Name (As matching Aadhaar)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 outline-none text-slate-800 dark:text-zinc-150 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1.5">PAN Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={kycPan}
                    onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 outline-none text-slate-850 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1.5">Aadhaar Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="1234 5678 9012"
                    value={kycAadhaar}
                    onChange={(e) => setKycAadhaar(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 outline-none text-slate-850 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1.5">Complete Permanent Address</label>
                <textarea
                  required
                  placeholder="Street name, floor, district..."
                  value={kycAddress}
                  onChange={(e) => setKycAddress(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 h-16 resize-none focus:outline-none text-slate-800 dark:text-zinc-200 font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-750 py-3 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 border-0 cursor-pointer"
              >
                Submit Documents
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 2. ADD FUNDS TRIGGER MODAL dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b dark:border-zinc-800 text-left">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-200">Add Wallet cash balance</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-zinc-350 font-bold border-0 bg-transparent cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-zinc-440 text-left">
              <label className="block text-[9px] uppercase tracking-wider">Amount to add (INR)</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 text-slate-808 dark:text-zinc-200 font-mono focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-505 italic">This integrates mockup Razorpay/Paytm banking system validations.</p>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 font-sans select-none">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-3.5 py-2 border dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-505 cursor-pointer">Cancel</button>
              <button type="button" onClick={executeAddFunds} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-sm border-0 cursor-pointer">Authorize UPI</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWAL LEDGER MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-90s/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b dark:border-zinc-800 text-left">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-250 font-black">Request cashout withdrawal</span>
              <button type="button" onClick={() => setShowWithdrawModal(false)} className="text-slate-450 hover:text-slate-800 dark:hover:text-zinc-350 font-black text-sm border-0 bg-transparent cursor-pointer">✕</button>
            </div>

            {withdrawStatus && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 border border-red-100 dark:border-red-900/40 text-[10.5px] font-bold text-left">
                {withdrawStatus}
              </div>
            )}

            <div className="space-y-3 text-xs font-extrabold text-slate-500 dark:text-zinc-440 text-left">
              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Transfer sum</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 font-mono text-slate-808 dark:text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-800 focus:outline-none text-slate-808 dark:text-zinc-205 cursor-pointer"
                  >
                    <option value="UPI">UPI address ID</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1">UPI ID or Bank Account details</label>
                <input
                  type="text"
                  placeholder={withdrawMethod === 'UPI' ? 'alex@okaxis' : 'IFSC Code SBIN0029, A/c: 98765432'}
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border dark:border-zinc-800 font-mono text-slate-850 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 select-none font-sans">
              <button type="button" onClick={() => setShowWithdrawModal(false)} className="px-3.5 py-2 border dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 cursor-pointer">Cancel</button>
              <button type="button" onClick={executeWithdrawFunds} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-sm border-0 cursor-pointer">Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
