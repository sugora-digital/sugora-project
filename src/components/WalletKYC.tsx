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
    <div id="wallet-kyc-main-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/20 p-1 md:p-4 rounded-3xl animate-fadeIn">
      
      {/* LEFT COLUMN: ACTIVE WALLET LEDGER ACTIONS */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Visa Glassmorphic wallet card */}
        <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-stone tracking-[0.15em] text-indigo-200">Sugora Pay Cash Vault</span>
              <h2 className="text-3xl font-black font-mono tracking-tight mt-1.5">
                ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
              </h2>
            </div>
            <span className="rounded bg-white/15 text-[9px] font-black uppercase px-2.5 py-1 border border-white/25">
              Secure Ledger
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[9.5px] text-indigo-200 uppercase font-bold">Main Cash balance</span>
              <span className="text-sm font-black font-mono">₹{wallet.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[9.5px] text-indigo-200 uppercase font-bold">Promo Sign-up Cash</span>
              <span className="text-sm font-black font-mono">₹{wallet.promo_balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-white/15">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 rounded-xl bg-white text-indigo-900 py-3 text-xs font-black hover:bg-slate-50 transition active:scale-95 shadow-md cursor-pointer"
            >
              Add Funds
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 rounded-xl bg-white/15 text-[#FFFFFF] py-3 text-xs font-black hover:bg-white/20 transition active:scale-95 border border-white/20"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Ledger logs */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Historical Wallet Statements</h3>
          <div className="space-y-3 max-h-[295px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-slate-50 hover:bg-slate-105 border rounded-2xl flex justify-between items-center text-xs transition duration-100">
                <div>
                  <span className="block font-bold text-slate-800">{tx.description}</span>
                  <span className="block text-[10px] text-slate-400 capitalize font-medium">{tx.type} • {tx.status}</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-bold text-slate-850">₹{tx.amount.toFixed(2)}</span>
                  <span className="block text-[9px] text-slate-400 font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No wallet activity logs recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: KYC STATUS COMPLIANCE FORM */}
      <div className="lg:col-span-6">
        
        {kycStatus === 'approved' ? (
          <div className="bg-white border rounded-3xl p-6 shadow-sm text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Compliance Verification Granted</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">Your Aadhaar and PAN check is completely confirmed. Bank payouts enabled.</p>
            </div>
            
            <div className="p-4 bg-slate-50 border rounded-2xl text-left text-xs font-bold font-mono text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Verification ID</span>
                <span className="text-slate-800">SUG-KYC-CONFIRMED</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status</span>
                <span className="text-emerald-600">ACTIVE CREATOR</span>
              </div>
            </div>
          </div>
        ) : kycStatus === 'pending' ? (
          <div className="bg-white border rounded-3xl p-6 shadow-sm text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-105 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Verification in progress</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">Document credentials are being evaluated by our Support agents. High priority checklist!</p>
            </div>
          </div>
        ) : (
          /* KYC Verification Form */
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-blue-600" /> Identity KYC verification Form
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-semibold">
                By reserve policy framework, upload Aadhaar & PAN numbers for instant wallet payout activation.
              </p>
            </div>

            <form onSubmit={handleKYCFormSubmit} className="space-y-4 text-xs font-bold text-slate-505">
              <div>
                <label className="block text-[9px] uppercase tracking-wider mb-1.5">Full Name (As matching Aadhaar)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 border outline-none text-slate-800"
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
                    className="w-full rounded-xl bg-slate-50 p-2.5 border outline-none text-slate-850 font-mono"
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
                    className="w-full rounded-xl bg-slate-50 p-2.5 border outline-none text-slate-850 font-mono"
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
                  className="w-full rounded-xl bg-slate-50 p-2.5 border h-16 resize-none focus:outline-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 hover:bg-black py-3 text-xs font-bold text-[#FFFFFF] shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                Submit Documents
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 2. ADD FUNDS TRIGGER MODAL dialog */}
      {showAddModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Add Wallet cash balance</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-500">
              <label className="block text-[9px] uppercase tracking-wider">Amount to add (INR)</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 border text-slate-800 font-mono focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 italic">This integrates mockup Razorpay/Paytm banking system validations.</p>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-3.5 py-2 border rounded-xl hover:bg-slate-55 font-bold">Cancel</button>
              <button onClick={executeAddFunds} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[#FFFFFF] font-black shadow-sm">Authorize UPI</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWAL LEDGER MODAL */}
      {showWithdrawModal && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-105 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 font-black">Request cashout withdrawal</span>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-450 hover:text-slate-800 font-black text-sm">✕</button>
            </div>

            {withdrawStatus && (
              <div className="p-3 rounded-xl bg-red-50 text-red-750 border border-red-100 text-[10.5px] font-bold">
                {withdrawStatus}
              </div>
            )}

            <div className="space-y-3 text-xs font-extrabold text-slate-500">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Transfer sum</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 p-2.5 border font-mono text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider mb-1">Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full rounded-xl bg-white p-2 border focus:outline-none"
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
                  className="w-full rounded-xl bg-slate-50 p-2.5 border font-mono text-slate-850 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowWithdrawModal(false)} className="px-3.5 py-2 border rounded-xl hover:bg-slate-50 text-slate-500">Cancel</button>
              <button onClick={executeWithdrawFunds} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[#FFFFFF] font-black shadow-sm">Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
