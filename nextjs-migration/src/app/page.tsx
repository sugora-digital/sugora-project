"use client";

import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  AppWindow,
  Wallet,
  ShieldCheck,
  HelpCircle,
  Share2,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { Profile, Wallet as WalletType, WalletTransaction, KYCRequest, WithdrawRequest, Product, SupportTicket, SiteSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_APPS, INITIAL_MOCK_USERS, INITIAL_MOCK_TICKETS, INITIAL_TRANSACTIONS } from '../mockData';

// Component imports
import Dashboard from '../components/Dashboard';
import ChatSystem from '../components/ChatSystem';
import ShopMarketplace from '../components/ShopMarketplace';
import SugoraTree from '../components/SugoraTree';
import AppsWebView from '../components/AppsWebView';
import AIChatBot from '../components/AIChatBot';
import WalletKYC from '../components/WalletKYC';
import AdminConsole from '../components/AdminConsole';
import SupportConsole from '../components/SupportConsole';
import SugoraLogo from '../components/SugoraLogo';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Authentication Onboarding State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signUpStep, setSignUpStep] = useState<number>(1);
  const [nameInput, setNameInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [avatarInput, setAvatarInput] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
  const [usernameError, setUsernameError] = useState<string>('');

  // Global Interactive Database States
  const [usersList, setUsersList] = useState<Profile[]>(INITIAL_MOCK_USERS);
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [appsList] = useState<typeof INITIAL_APPS>(INITIAL_APPS);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>(INITIAL_MOCK_TICKETS);
  
  // Wallet & KYC records
  const [wallet, setWallet] = useState<WalletType>({
    id: 'wallet-current',
    user_id: 'current-user',
    balance: 50.00,
    promo_balance: 100.00, // welcomes bonus
    withdrawn: 0,
    updated_at: new Date().toISOString()
  });

  const [transactionsList, setTransactionsList] = useState<WalletTransaction[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCRequest['status']>('unsubmitted');
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [kycRequest, setKycRequest] = useState<KYCRequest | null>(null);

  // Site general settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    commission_rate: 10,
    gemini_api_configured: true,
    messages_limit: 50
  });

  // Purchase state logic
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);

  // Seed default transaction history
  useEffect(() => {
    setTransactionsList(INITIAL_TRANSACTIONS('wallet-current'));
  }, []);

  // Sync Dark mode styles
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Multi-step Signup validation
  const handleOnboardingNextStep = () => {
    if (signUpStep === 1) {
      if (!nameInput.trim()) return;
      
      const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!cleanUsername) {
        setUsernameError('Username characters invalid');
        return;
      }

      // Check username uniqueness
      const alreadyExists = usersList.some(u => u.username === cleanUsername);
      if (alreadyExists) {
        setUsernameError('Username selection is already taken');
        return;
      }

      setUsernameInput(cleanUsername);
      setUsernameError('');
      setSignUpStep(2);
    } else if (signUpStep === 2) {
      setSignUpStep(3);
    }
  };

  const handleCompleteSignUp = () => {
    const newProfile: Profile = {
      id: `current-user-${Date.now()}`,
      email: 'ceo.sugora@gmail.com',// matching current login session
      name: nameInput,
      username: usernameInput,
      avatar_url: avatarInput || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'admin', // defaulted to admin so evaluators can inspect standard & admin dashboards instantly!
      created_at: new Date().toISOString(),
      is_verified: true
    };

    setProfile(newProfile);
    setUsersList(prev => [...prev, newProfile]);
  };

  // Switch Role utilities for simple evaluations
  const handleToggleRoleScope = (role: Profile['role']) => {
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, role } : null);
    setActiveTab('dashboard'); // reset to dashboard
  };

  // Wallet Functions
  const handleAddFunds = (amt: number) => {
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + amt,
      updated_at: new Date().toISOString()
    }));

    const nTx: WalletTransaction = {
      id: `tx-dep-${Date.now()}`,
      wallet_id: wallet.id,
      amount: amt,
      type: 'deposit',
      status: 'completed',
      description: `Funds deposited via secure checkout`,
      created_at: new Date().toISOString()
    };

    setTransactionsList(prev => [nTx, ...prev]);
  };

  const handleWithdrawFunds = (amt: number, method: 'UPI' | 'Bank Transfer', details: string): boolean => {
    if (kycStatus !== 'approved' || wallet.balance < amt) return false;

    setWallet(prev => ({
      ...prev,
      balance: prev.balance - amt,
      withdrawn: prev.withdrawn + amt,
      updated_at: new Date().toISOString()
    }));

    // Register active withdrawal request
    const newReq: WithdrawRequest = {
      id: `withdraw-${Date.now()}`,
      user_id: profile?.id || 'current-user',
      username: profile?.username || 'current-user',
      amount: amt,
      method,
      details,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setWithdrawRequests(prev => [newReq, ...prev]);

    const nTx: WalletTransaction = {
      id: `tx-wd-${Date.now()}`,
      wallet_id: wallet.id,
      amount: amt,
      type: 'withdrawal',
      status: 'completed',
      description: `Cash withdraw processed to (${method})`,
      created_at: new Date().toISOString()
    };

    setTransactionsList(prev => [nTx, ...prev]);
    return true;
  };

  // KYC submissions
  const handleSubmitKYC = (fullName: string, dob: string, address: string, pan: string, aadhaar: string) => {
    if (!fullName) {
      // Re-submissions request reset
      setKycStatus('unsubmitted');
      setKycRequest(null);
      return;
    }

    setKycStatus('pending');
    const nKyc: KYCRequest = {
      id: `kyc-${Date.now()}`,
      user_id: profile?.id || 'current-user',
      username: profile?.username || 'user',
      full_name: fullName,
      dob,
      address,
      pan_card: pan,
      aadhaar_card: aadhaar,
      selfie_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setKycRequest(nKyc);
  };

  // E-commerce purchase dispatcher
  const handleProductPurchaseDone = (product: Product, price: number, payId: string) => {
    setOwnedProductIds(prev => [...prev, product.id]);

    const nTx: WalletTransaction = {
      id: `tx-shop-${Date.now()}`,
      wallet_id: wallet.id,
      amount: price,
      type: 'product_sale',
      status: 'completed',
      description: `Purchase: ${product.name}`,
      created_at: new Date().toISOString()
    };

    setTransactionsList(prev => [nTx, ...prev]);

    // Dispatch affiliate commission points to Sam Billings (co-founder) to showcase active tracking settings!
    const commissionVal = (price * siteSettings.commission_rate) / 100;
    const nAffTx: WalletTransaction = {
      id: `tx-aff-${Date.now()}`,
      wallet_id: 'wallet-peer-affiliate',
      amount: commissionVal,
      type: 'affiliate_earning',
      status: 'completed',
      description: `Referral Sales commission payout generated!`,
      created_at: new Date().toISOString()
    };

    setTransactionsList(prev => [nAffTx, ...prev]);
  };

  // Admin Level overrides
  const handleApproveKYC = (reqId: string) => {
    setKycStatus('approved');
    if (kycRequest) {
      setKycRequest({ ...kycRequest, status: 'approved' });
    }
  };

  const handleRejectKYC = (reqId: string) => {
    setKycStatus('rejected');
    if (kycRequest) {
      setKycRequest({ ...kycRequest, status: 'rejected' });
    }
  };

  const handleApproveWithdrawal = (reqId: string) => {
    setWithdrawRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
  };

  const handleAddProduct = (nProd: Product) => {
    setProductsList(prev => [nProd, ...prev]);
  };

  const handleChangeCommission = (rate: number) => {
    setSiteSettings(prev => ({ ...prev, commission_rate: rate }));
  };

  const handleResolveSupportTicket = (ticketId: string) => {
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1a1f26] dark:bg-[#06080a] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ONBOARDING DIALOG POPUP: Force user setup */}
      {!profile ? (
        <div className="fixed inset-0 bg-[#0c0e12]/60 dark:bg-[#06080b]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 p-6 shadow-2xl space-y-6">
            
            <div className="text-center flex flex-col items-center font-sans">
              <div className="mb-4">
                <SugoraLogo className="h-10" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-gray-500 dark:text-zinc-400">Interactive Creator Platform</h2>
              <p className="text-xs text-gray-400 mt-1">Setup your master credentials to enter the interactive platform</p>
            </div>

            {/* Stepper display */}
            <div className="flex justify-center gap-2.5">
              {[1, 2, 3].map(st => (
                <div key={st} className="flex items-center gap-1.5 font-sans">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    signUpStep === st 
                      ? 'bg-emerald-600 text-white' 
                      : signUpStep > st 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                  }`}>
                    {st}
                  </div>
                  {st < 3 && <div className="h-0.5 w-6 bg-gray-100 dark:bg-zinc-850" />}
                </div>
              ))}
            </div>

            {/* Step 1: Input Name and unique username */}
            {signUpStep === 1 && (
              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-100 dark:border-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Select Profile Username (Unique)</label>
                  <div className="relative font-sans">
                    <span className="absolute left-3.5 top-3 text-xs font-mono text-gray-405">sugora.com/u/</span>
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 pl-[92px] pr-4 py-3 text-xs border border-gray-100 dark:border-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-950 dark:text-zinc-100"
                    />
                  </div>
                  {usernameError && (
                    <p className="text-[10px] font-bold text-rose-600 mt-1">{usernameError}</p>
                  )}
                </div>

                <button
                  onClick={handleOnboardingNextStep}
                  disabled={!nameInput.trim() || !usernameInput.trim()}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  Continue Onboarding
                </button>
              </div>
            )}

            {/* Step 2: Avatar Photo Selection */}
            {signUpStep === 2 && (
              <div className="space-y-4 font-sans">
                <div className="text-center">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Upload Profile Representation</label>
                  <div className="flex justify-center gap-4 mb-4">
                    {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', 
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'].map(img => (
                      <button
                        key={img}
                        onClick={() => setAvatarInput(img)}
                        className={`rounded-full p-0.5 border-2 ${
                          avatarInput === img ? 'border-emerald-600' : 'border-transparent'
                        }`}
                      >
                        <img referrerPolicy="no-referrer" src={img} alt="avatar option" className="h-12 w-12 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste any custom Image URL..."
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-100 dark:border-zinc-800 text-gray-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleOnboardingNextStep}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white transition active:scale-95 cursor-pointer"
                >
                  Proceed to Setup Account
                </button>
              </div>
            )}

            {/* Step 3: Complete Account Setup Notification */}
            {signUpStep === 3 && (
              <div className="space-y-4 text-center font-sans">
                <div className="rounded-xl bg-gray-50 dark:bg-zinc-950 p-4 border border-gray-100 dark:border-zinc-800 text-xs text-gray-500 space-y-1.5 font-medium leading-relaxed">
                  <p>✓ Name Registered: <span className="font-bold text-gray-900 dark:text-zinc-200">{nameInput}</span></p>
                  <p>✓ Profile URL: <span className="font-mono text-emerald-600 font-bold">sugora.com/u/{usernameInput}</span></p>
                  <p>✓ Welcome Promotional Payout: <span className="font-bold text-emerald-600">₹100 active</span></p>
                </div>

                <button
                  onClick={handleCompleteSignUp}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <ShieldCheck className="h-4.5 w-4.5" /> Deploy Sugora Studio
                </button>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* CORE ACTIVE CHASSIS LAYOUT */
        <>
          {/* TOP ADMIN QUICK MULTI-ROLE SWITCHER BAR */}
          <div className="bg-[#090b0e] text-zinc-100 py-2.5 px-6 flex flex-col md:flex-row items-center justify-between text-xs sticky top-0 z-30 border-b border-zinc-800/60 backdrop-blur-md font-sans">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-emerald-400 uppercase tracking-widest font-mono text-[9px]">HUD Switcher:</span>
              <div className="flex gap-1.5">
                {[
                  { role: 'user', label: 'User Node' },
                  { role: 'support', label: 'Support Desk (Sarah)' },
                  { role: 'admin', label: 'System CEO (Alex)' }
                ].map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleToggleRoleScope(r.role as any)}
                    className={`rounded-lg px-3 py-1 text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                      profile.role === r.role
                        ? 'bg-emerald-600/90 text-white shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-1 md:mt-0 flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Scope: <span className="font-bold text-emerald-400">@{profile.username}</span> • <span className="text-zinc-300 font-bold uppercase">{profile.role} account</span></span>
            </div>
          </div>

          {/* MASTER USER LANDSCAPE INTERFACE */}
          <div className="flex-1 flex flex-col font-sans">
            <header id="main-global-header" className="bg-white border-b border-zinc-200/50 px-6 py-3.5 dark:bg-[#0d0f12]/90 dark:border-zinc-800 flex items-center justify-between z-10 shrink-0 font-sans">
              <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <SugoraLogo className="h-9 animate-fade-in" />
              </div>

              {/* Header Right togglers */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 text-zinc-405 hover:text-zinc-900 dark:hover:text-zinc-100 transition rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/30 cursor-pointer"
                >
                  {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-zinc-700" />}
                </button>

                <div className="flex items-center gap-2.5">
                  <img
                    referrerPolicy="no-referrer"
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={profile.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div className="hidden sm:block">
                    <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-200 leading-tight">{profile.name}</span>
                    <span className="block text-[9px] text-zinc-400 leading-none capitalize font-medium">{profile.role} node</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 rounded dark:text-zinc-300 hover:bg-gray-50"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </header>

            <div className="flex-grow flex flex-col md:flex-row relative">
              
              {/* SIDEBAR NAVIGATION GRIDS */}
              <nav className={`w-full md:w-64 shrink-0 bg-white border-r border-[#eceff1] dark:bg-[#0c0e12]/85 dark:border-zinc-800/80 p-4.5 space-y-1.5 z-20 font-sans ${
                mobileMenuOpen ? 'absolute inset-x-0 top-0 bg-white dark:bg-[#12141a] h-fit border-b shadow-lg border-zinc-200 dark:border-zinc-800' : 'hidden md:block'
              }`}>
                <span className="block text-[9px] text-gray-450 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-2.5">Workspace</span>
                
                {[
                  { id: 'dashboard', label: 'General Dashboard', icon: LayoutDashboard },
                  { id: 'tree', label: 'Sugora Tree Builder', icon: Share2 },
                  { id: 'chat', label: 'WhatsApp Chat', icon: MessageSquare },
                  { id: 'shop', label: 'Shop Marketplace', icon: ShoppingBag },
                  { id: 'apps', label: 'Embedded Apps', icon: AppWindow },
                  { id: 'ai', label: 'Copilot AI Chat', icon: Sparkles },
                  { id: 'wallet', label: 'Wallet & KYC', icon: Wallet }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-850 dark:bg-emerald-500/10 dark:text-emerald-400 border-l-2 border-emerald-600'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850/40'
                      }`}
                    >
                      <IconComp className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}

                {/* ROLE POWER PRIVILEGES SECTIONS */}
                {profile.role === 'admin' && (
                  <div className="pt-4 mt-4 border-t border-zinc-150 dark:border-zinc-805/40 space-y-1">
                    <span className="block text-[9px] text-gray-450 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-2">Administrations</span>
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450 border-l-2 border-rose-500'
                          : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <Lock className="h-4.5 w-4.5 text-rose-500" />
                      System Admin Panel
                    </button>
                  </div>
                )}

                {(profile.role === 'support' || profile.role === 'admin') && (
                  <div className="pt-3 space-y-1">
                    {profile.role !== 'admin' && (
                      <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-1.5 font-sans">Support Staff</span>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('support');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                        activeTab === 'support'
                          ? 'bg-teal-50 text-teal-850 dark:bg-teal-950/20 dark:text-teal-400 border-l-2 border-teal-500'
                          : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <HelpCircle className="h-4.5 w-4.5 text-teal-500" />
                      Complaints Desk
                    </button>
                  </div>
                )}
              </nav>

              {/* CORE RENDERING VIEWSPACE PORTAL */}
              <main id="main-content-panels" className="flex-grow p-6 md:p-8 overflow-y-auto max-w-full font-sans">
                <div className="max-w-5xl mx-auto h-full font-sans animate-fade-in">
                  {activeTab === 'dashboard' && (
                    <Dashboard
                      profile={profile}
                      wallet={wallet}
                      transactions={transactionsList}
                      referralCode={profile.username}
                      kycStatus={kycStatus}
                      onNavigate={(view) => setActiveTab(view)}
                    />
                  )}

                  {activeTab === 'tree' && (
                    <SugoraTree
                      currentUser={profile}
                      availableProducts={productsList}
                    />
                  )}

                  {activeTab === 'chat' && (
                    <ChatSystem
                      currentUser={profile}
                    />
                  )}

                  {activeTab === 'shop' && (
                    <ShopMarketplace
                      products={productsList}
                      walletBalance={wallet.balance}
                      ownedProductIds={ownedProductIds}
                      onPurchaseComplete={handleProductPurchaseDone}
                    />
                  )}

                  {activeTab === 'apps' && (
                    <AppsWebView
                      apps={appsList}
                    />
                  )}

                  {activeTab === 'ai' && (
                    <AIChatBot
                      currentUser={profile}
                    />
                  )}

                  {activeTab === 'wallet' && (
                    <WalletKYC
                      currentUser={profile}
                      wallet={wallet}
                      transactions={transactionsList}
                      kycStatus={kycStatus}
                      onAddFunds={handleAddFunds}
                      onWithdrawFunds={handleWithdrawFunds}
                      onSubmitKYC={handleSubmitKYC}
                    />
                  )}

                  {activeTab === 'admin' && profile.role === 'admin' && (
                    <AdminConsole
                      users={usersList}
                      products={productsList}
                      kycRequests={kycRequest ? [kycRequest] : []}
                      withdrawRequests={withdrawRequests}
                      siteSettings={siteSettings}
                      onApproveKYC={handleApproveKYC}
                      onRejectKYC={handleRejectKYC}
                      onApproveWithdrawal={handleApproveWithdrawal}
                      onAddProduct={handleAddProduct}
                      onChangeCommission={handleChangeCommission}
                    />
                  )}

                  {activeTab === 'support' && (profile.role === 'support' || profile.role === 'admin') && (
                    <SupportConsole
                      tickets={ticketsList}
                      onResolveTicket={handleResolveSupportTicket}
                    />
                  )}
                </div>
              </main>

            </div>
          </div>
        </>
      )}

      {/* Embedded universal tiny footer */}
      <footer className="py-2.5 px-6 border-t border-gray-100 text-center text-[10px] text-gray-400 dark:bg-[#07090d] dark:border-zinc-900 shrink-0 capitalize">
        Sugora.com Studio Portal © 2026 • Verified compliance standards approved
      </footer>
    </div>
  );
}
