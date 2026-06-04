"use client";

import React, { useState } from 'react';
import { Landmark, CreditCard, CheckCircle, ShieldAlert, AlertCircle, FileText, Camera } from 'lucide-react';
import { Profile, Wallet as WalletType, WalletTransaction } from '../types';

interface WalletKYCProps {
  currentUser: Profile;
  wallet: WalletType;
  transactions: WalletTransaction[];
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  onAddFunds: (amount: number) => void;
  onWithdrawFunds: (amount: number, method: 'UPI' | 'Bank Transfer', details: string) => boolean | null;
  onSubmitKYC: (fullName: string, dob: string, address: string, pan: string, aadhaar: string) => void;
}

export default function WalletKYC({
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

  const executeWithdrawFunds = () => {
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

    const success = onWithdrawFunds(amt, withdrawMethod, withdrawDetails);
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
    <div id="wallet-kyc-main-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* LEFT COLUMN: ACTIVE WALLET LEDGER ACTIONS */}
      <div className="lg:col-span-12 xl:col-span-6 space-y-6">
        <div className="bg-[#131722] border border-indigo-500/20 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-white/10 blur-2xl"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Sugora Pay Cash Ledger</span>
              <h2 className="text-3xl font-bold font-mono tracking-tight mt-1">
                ₹{(wallet.balance + wallet.promo_balance).toFixed(2)}
              </h2>
            </div>
            <span className="rounded bg-white/10 text-[10px] font-bold px-2 py-0.5 border border-white/20">
              verified secure
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] text-indigo-200 uppercase font-semibold">Available Main Cash</span>
              <span className="text-sm font-bold font-mono">₹{wallet.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[10px] text-indigo-200 uppercase font-semibold">Promo Welcome Bonus</span>
              <span className="text-sm font-bold font-mono">₹{wallet.promo_balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 rounded-xl bg-white text-indigo-900 py-3 text-xs font-bold transition hover:bg-indigo-50 shadow-sm active:scale-95"
            >
              Add Funds
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 rounded-xl bg-indigo-600/60 border border-indigo-400 text-white py-3 text-xs font-bold transition hover:bg-indigo-500 shadow-sm active:scale-95"
            >
              Withdraw Cash
            </button>
          </div>
        </div>

        {/* Ledger logs */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Earning Disbursements History</h3>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3 border-gray-50 dark:border-zinc-800/20 text-xs">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-zinc-200">{tx.description}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{tx.type} • {new Date(tx.created_at).toLocaleDateString()}</span>
                </div>
                <span className={`font-bold font-mono ${
                  tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-600'
                }`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: KYC REGISTRATION & STATUS */}
      <div className="lg:col-span-12 xl:col-span-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" /> KYC Identity Assessment
          </h2>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            RBI compliance regulations mandate approved KYC submissions before releasing any UPI or bank-transfer withdrawal requests.
          </p>

          {kycStatus === 'unsubmitted' && (
            <form onSubmit={handleKYCFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Full Legal Name (Matching PAN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    value={kycPan}
                    onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                    className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Aadhaar Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="12 digit registration"
                    maxLength={12}
                    value={kycAadhaar}
                    onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2.5 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Residential Address</label>
                <textarea
                  required
                  placeholder="Street details, pincode, state info..."
                  value={kycAddress}
                  onChange={(e) => setKycAddress(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 px-3 py-2 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-16 resize-none"
                />
              </div>

              {/* Doc attachments simulators */}
              <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 flex justify-around gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Camera className="h-4 w-4" /> Selfie Verification (Simulated)</span>
                <span>•</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Aadhaar Attachment</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white shadow-md active:scale-95 transition"
              >
                Submit KYC Assessment
              </button>
            </form>
          )}

          {kycStatus === 'pending' && (
            <div className="p-8 text-center bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/50">
              <Camera className="h-8 w-8 text-blue-500 animate-bounce mx-auto mb-3" />
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Application Under Inspection</h4>
              <p className="text-xs text-blue-600 mt-2 leading-relaxed">
                Thank you! We have logged your Aadhaar and PAN documents. Our compliance team is verifying details. Approvals completed inside few hours.
              </p>
              <div className="mt-4 p-2.5 bg-blue-100/50 dark:bg-blue-950/45 rounded-xl border border-blue-200 text-[10px] text-blue-800 dark:text-blue-300">
                Tip: You can login as **Admin** via role switcher to immediately approve yourself!
              </div>
            </div>
          )}

          {kycStatus === 'approved' && (
            <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">RBI KYC Verification Completed!</h4>
              <p className="text-xs text-emerald-600 mt-2 leading-relaxed">
                State verified successfully. Automated payouts and UPI withdraw limits have been elevated to ₹1,00,000 daily.
              </p>
            </div>
          )}

          {kycStatus === 'rejected' && (
            <div className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50">
              <ShieldAlert className="h-8 w-8 text-rose-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">KYC Submission Rejected</h4>
              <p className="text-xs text-rose-600 mt-2 leading-relaxed">
                Our team could not confirm Aadhaar matching PAN credentials. Please check details or consult Support.
              </p>
              <button
                onClick={() => onSubmitKYC('', kycDob, '', '', '')} // resets state internally in parent
                className="mt-4 text-xs font-semibold text-rose-700 underline"
              >
                Re-submit application form
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POPUP: ADD LEDGER CASH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border dark:border-zinc-800/80">
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 mb-2">
              <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
              Add Funds to Wallet
            </h3>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Deposit cash value (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 pl-7 pr-3 py-2.5 text-xs text-gray-900 dark:text-zinc-100 border text-medium border-gray-100 dark:border-zinc-850"
                  />
                </div>
              </div>

              {/* Fast presets */}
              <div className="flex gap-2">
                {['200', '500', '1000', '5000'].map(chips => (
                  <button
                    key={chips}
                    onClick={() => setAddAmount(chips)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 rounded text-gray-700 dark:text-zinc-300"
                  >
                    +₹{chips}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-2 text-xs text-gray-500">Cancel</button>
              <button onClick={executeAddFunds} className="rounded-xl bg-indigo-600 text-white font-bold text-xs px-4 py-2 hover:bg-indigo-700">
                Checkout with Razorpay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: WITHDRAW CASH MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border dark:border-zinc-800/80 font-sans">
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 mb-2">
              <Landmark className="h-4.5 w-4.5 text-rose-500" />
              Initiate Bank Withdrawal
            </h3>

            {kycStatus !== 'approved' ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex gap-2 mt-4">
                <AlertCircle className="h-5 w-5 shrink-0 animate-bounce" />
                <span>Rejected: RBI mandates a verification level of **APPROVED** KYC status prior to any withdrawal activity.</span>
              </div>
            ) : (
              <div className="space-y-4 mt-4 text-xs text-gray-700 dark:text-zinc-300">
                <div>
                  <label className="block text-[10px] tracking-wide text-gray-400 font-bold mb-1">Transfer Gateway</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={withdrawMethod === 'UPI'} onChange={() => setWithdrawMethod('UPI')} /> UPI ID
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={withdrawMethod === 'Bank Transfer'} onChange={() => setWithdrawMethod('Bank Transfer')} /> Bank Transfer
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-wide text-gray-400 font-bold mb-1">Withdrawal Amount (Min ₹100)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-wide text-gray-400 font-bold mb-1">
                    {withdrawMethod === 'UPI' ? 'Beneficiary UPI Account (e.g. upi@gpay)' : 'Bank Account Number & IFSC details'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={withdrawMethod === 'UPI' ? 'name@ybl' : 'AC: 123456789, IFSC: SBIN0001'}
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    className="w-full rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs border border-gray-100 dark:border-zinc-800"
                  />
                </div>

                {withdrawStatus && (
                  <p className="text-[10px] font-bold text-rose-600 animate-pulse">{withdrawStatus}</p>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 justify-end">
              <button onClick={() => {
                setShowWithdrawModal(false);
                setWithdrawStatus(null);
              }} className="px-3 py-2 text-xs text-gray-500">Cancel</button>
              {kycStatus === 'approved' && (
                <button onClick={executeWithdrawFunds} className="rounded-xl bg-rose-600 text-white font-bold text-xs px-4 py-2 hover:bg-rose-700">
                  Withdraw Cash
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
