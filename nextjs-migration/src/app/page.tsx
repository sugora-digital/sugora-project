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
  X,
  BarChart2,
  Users,
  ShieldAlert,
  ShoppingCart,
  Settings,
  Layout,
  AlertTriangle,
  Clock,
  CheckCircle
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
import { supabase } from '../lib/supabase';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Embedded light state-based SPA router
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [roleInput, setRoleInput] = useState<'user' | 'support' | 'admin'>('user');

  // Admin and Support active sub-states for direct sidebar routing
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'users' | 'kyc' | 'shop' | 'branding' | 'pages' | 'settings'>('stats');
  const [supportFilter, setSupportFilter] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    setAuthError('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const handleLocationChange = () => {
        setCurrentPath(window.location.pathname);
      };
      window.addEventListener('popstate', handleLocationChange);
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, []);

  // Authentication State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [nameInput, setNameInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [avatarInput, setAvatarInput] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);

  // Set default panel / activeTab on user profile load based on user role
  useEffect(() => {
    if (profile) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        navigateTo('/');
      }
      if (profile.role === 'admin') {
        setActiveTab('admin');
      } else if (profile.role === 'support') {
        setActiveTab('support');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [profile]);

  // Quick Sign In helper (similar to App.tsx)
  const handleQuickSignIn = async (role: 'user' | 'support' | 'admin') => {
    setIsAuthLoading(true);
    setAuthError('');
    
    const mockEmail = `${role}@sugora.com`;
    setEmailInput(mockEmail);
    setPasswordInput('password123');

    try {
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      if (!isPlaceholder) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: mockEmail,
            password: 'password123'
          });
          if (error) {
            // Register on the fly
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: mockEmail,
              password: 'password123',
              options: {
                data: {
                  name: role === 'admin' ? 'Owner Admin' : role === 'support' ? 'Agent Sarah' : 'Demo User',
                  username: `${role}_tester`,
                  avatar_url: role === 'support' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                }
              }
            });
            if (signUpErr) throw signUpErr;
            if (signUpData.user) {
              const newProfile: Profile = {
                id: signUpData.user.id,
                email: mockEmail,
                name: role === 'admin' ? 'Owner Admin' : role === 'support' ? 'Agent Sarah' : 'Demo User',
                username: `${role}_tester`,
                role: role,
                avatar_url: role === 'support' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                created_at: new Date().toISOString(),
                is_verified: true
              };
              setProfile(newProfile);
            }
          } else if (data.user) {
            const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
            if (dbProfile) {
              const updatedProfile = { ...(dbProfile as Profile), role };
              setProfile(updatedProfile);
            } else {
              const newProfile: Profile = {
                id: data.user.id,
                email: mockEmail,
                name: role === 'admin' ? 'Owner Admin' : role === 'support' ? 'Agent Sarah' : 'Demo User',
                username: `${role}_tester`,
                role: role,
                avatar_url: role === 'support' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                created_at: new Date().toISOString(),
                is_verified: true
              };
              setProfile(newProfile);
            }
          }
        } catch (err: any) {
          setProfile({
            id: `san-${role}-${Date.now()}`,
            email: mockEmail,
            name: role === 'admin' ? 'Owner Admin' : role === 'support' ? 'Agent Sarah' : 'Demo User',
            username: `${role}_tester`,
            role: role,
            avatar_url: role === 'support' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
            created_at: new Date().toISOString(),
            is_verified: true
          });
        }
      } else {
        const fallbackId = `demo-${role}-${Date.now()}`;
        setProfile({
          id: fallbackId,
          email: mockEmail,
          name: role === 'admin' ? 'Owner Admin' : role === 'support' ? 'Agent Sarah' : 'Demo User',
          username: `${role}_tester`,
          role: role,
          avatar_url: role === 'support' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          is_verified: true
        });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Quick login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

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
  const [kycStatus, setKycStatus] = useState<KYCRequest['status'] | 'unsubmitted'>('unsubmitted');
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

  // Session recovery on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
        if (isPlaceholder) {
          // sandbox mock session lookup
          const savedMockUser = localStorage.getItem('sugora_mock_profile');
          if (savedMockUser) {
            const parsed = JSON.parse(savedMockUser);
            setProfile(parsed);
          }
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && session.user) {
          setIsSupabaseActive(true);
          // Fetch real profile from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            // Optionally fetch real wallet
            const { data: walletData } = await supabase
              .from('wallets')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            if (walletData) {
              setWallet({
                id: walletData.id,
                user_id: walletData.user_id,
                balance: Number(walletData.balance),
                promo_balance: Number(walletData.promo_balance),
                withdrawn: Number(walletData.withdrawn),
                updated_at: walletData.updated_at
              });
            }
          }
        }
      } catch (err) {
        console.warn('Isomorphic Session recovery fallback:', err);
      }
    }
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('sugora_mock_profile');
      if (isSupabaseActive) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setProfile(null);
    setActiveTab('dashboard');
  };

  const handleSignInSubmit = async (e: React.FormEvent, forcedRole?: 'user' | 'support' | 'admin') => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please fill in both email and password.');
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');

    // If a forced role is not passed, determine based on currentPath (client router state)
    const resolvedRole = forcedRole || (currentPath === '/admin-signin' || currentPath === '/admin' ? 'admin' : currentPath === '/supportdesk-signin' || currentPath === '/supporting' || currentPath === '/support' ? 'support' : 'user');

    try {
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      if (isPlaceholder) {
        // Check standard mock accounts
        const matchedMock = usersList.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
        
        const authenticatedProfile: Profile = matchedMock || {
          id: `usr-${Date.now()}`,
          email: emailInput.trim(),
          name: emailInput.split('@')[0],
          username: emailInput.split('@')[0].replace(/[^a-z0-9]/g, ''),
          avatar_url: avatarInput,
          role: resolvedRole,
          created_at: new Date().toISOString(),
          is_verified: true
        };

        localStorage.setItem('sugora_mock_profile', JSON.stringify(authenticatedProfile));
        setProfile(authenticatedProfile);
        setIsAuthLoading(false);
        return;
      }

      // Real Supabase signin
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput
      });

      if (authErr) throw authErr;
      if (!authData.user) throw new Error('No user session credentials found.');

      // Retrieve real profile from profiles table
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileErr || !profileData) {
        const fallbackProfile: Profile = {
          id: authData.user.id,
          email: authData.user.email || emailInput.trim(),
          name: authData.user.user_metadata?.full_name || 'Sugora User',
          username: authData.user.user_metadata?.username || 'user' + Date.now().toString().slice(-4),
          avatar_url: authData.user.user_metadata?.avatar_url || avatarInput,
          role: resolvedRole,
          created_at: new Date().toISOString(),
          is_verified: true
        };
        setProfile(fallbackProfile);
      } else {
        // Force the role to matched resolved path role to ensure login to specific panel
        const updatedProfile = { ...(profileData as Profile), role: resolvedRole };
        setProfile(updatedProfile);
      }

      setIsSupabaseActive(true);

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (walletData) {
        setWallet({
          id: walletData.id,
          user_id: walletData.user_id,
          balance: Number(walletData.balance),
          promo_balance: Number(walletData.promo_balance),
          withdrawn: Number(walletData.withdrawn),
          updated_at: walletData.updated_at
        });
      }

    } catch (err: any) {
      console.error('SignIn error:', err);
      setAuthError(err.message || 'Incorrect sign-in. For sandbox trial, please use any email/password.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim() || !nameInput.trim() || !usernameInput.trim()) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      setAuthError('Username contains invalid characters.');
      setIsAuthLoading(false);
      return;
    }

    try {
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      if (isPlaceholder) {
        const mockNewProfile: Profile = {
          id: `usr-${Date.now()}`,
          email: emailInput.trim(),
          name: nameInput.trim(),
          username: cleanUsername,
          avatar_url: avatarInput,
          role: emailInput.trim().toLowerCase() === 'ceo.sugora@gmail.com' ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          is_verified: true
        };
        
        localStorage.setItem('sugora_mock_profile', JSON.stringify(mockNewProfile));
        setProfile(mockNewProfile);
        setUsersList(prev => [...prev, mockNewProfile]);
        
        setWallet({
          id: `wallet-${Date.now()}`,
          user_id: mockNewProfile.id,
          balance: 0.00,
          promo_balance: 100.00,
          withdrawn: 0.00,
          updated_at: new Date().toISOString()
        });
        
        setIsAuthLoading(false);
        return;
      }

      // Live Supabase signup
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: emailInput.trim(),
        password: passwordInput,
        options: {
          data: {
            full_name: nameInput.trim(),
            username: cleanUsername
          }
        }
      });

      if (authErr) throw authErr;
      if (!authData.user) throw new Error('No user returned from signup.');

      // Insert profile in profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: emailInput.trim(),
          name: nameInput.trim(),
          username: cleanUsername,
          avatar_url: avatarInput,
          role: emailInput.trim().toLowerCase() === 'ceo.sugora@gmail.com' ? 'admin' : 'user',
          is_verified: true
        });

      if (profileErr) throw profileErr;

      // wallet is auto-created by postgres trigger on database!
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (walletData) {
        setWallet({
          id: walletData.id,
          user_id: walletData.user_id,
          balance: Number(walletData.balance),
          promo_balance: Number(walletData.promo_balance),
          withdrawn: Number(walletData.withdrawn),
          updated_at: walletData.updated_at
        });
      }

      const verifiedProfile: Profile = {
        id: authData.user.id,
        email: emailInput.trim(),
        name: nameInput.trim(),
        username: cleanUsername,
        avatar_url: avatarInput,
        role: emailInput.trim().toLowerCase() === 'ceo.sugora@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        is_verified: true
      };

      setProfile(verifiedProfile);
      setUsersList(prev => [...prev, verifiedProfile]);
      setIsSupabaseActive(true);

    } catch (err: any) {
      console.error('Signup error:', err);
      setAuthError(err.message || 'Verification error, or setup was not configured completely.');
    } finally {
      setIsAuthLoading(false);
    }
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
      
      {!profile ? (
        <div className="min-h-screen bg-white text-[#1a1f26] flex flex-col justify-center items-center p-4 sm:p-8 relative selection:bg-indigo-100 overflow-y-auto w-full">
          {/* Subtle elegant colorful background gradient blobbies */}
          <div className="absolute top-10 left-10 w-48 sm:w-80 h-48 sm:h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 sm:w-80 h-48 sm:h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-36 sm:w-60 h-36 sm:h-60 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />

          {currentPath === '/admin-signin' || currentPath === '/admin' ? (
            /* OWNER TERMINAL LOGIN SCREEN */
            <div id="admin-signin-gate" className="w-full max-w-sm my-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 relative z-10 animate-fade-in">
              <div className="text-center flex flex-col items-center">
                <div className="mb-2">
                  <SugoraLogo className="h-10" />
                </div>
                <h2 className="text-md font-bold tracking-tight text-slate-800 uppercase font-sans mt-2">Owner Admin Terminal</h2>
                <p className="text-[10px] text-slate-450 uppercase tracking-widest font-bold font-sans mt-0.5">Corporate Access Only</p>
              </div>

              {authError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/80 p-3.5 text-xs text-rose-700 font-medium">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={(e) => handleSignInSubmit(e, 'admin')} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Admin Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="ceo.sugora@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-900 text-white hover:bg-black py-3 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    Verify & Open Terminal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('admin')}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white py-3 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md text-center"
                  >
                     ⚡ Direct CEO Desk Access
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('/')}
                    className="w-full rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 py-2 text-[10px] font-bold transition text-center cursor-pointer border border-slate-200"
                  >
                    ← Back to General Entrance
                  </button>
                </div>
              </form>
            </div>
          ) : currentPath === '/supportdesk-signin' || currentPath === '/supporting' || currentPath === '/support' ? (
            /* SUPPORT DECK LOGIN SCREEN */
            <div id="support-signin-gate" className="w-full max-w-sm my-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 relative z-10 animate-fade-in">
              <div className="text-center flex flex-col items-center">
                <div className="mb-2">
                  <SugoraLogo className="h-10" />
                </div>
                <h2 className="text-md font-bold tracking-tight text-slate-800 uppercase font-sans mt-2">Support Desk Console</h2>
                <p className="text-[10px] text-slate-450 uppercase tracking-widest font-bold font-sans mt-0.5">Staff Communication Portal</p>
              </div>

              {authError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/80 p-3.5 text-xs text-rose-700 font-medium">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={(e) => handleSignInSubmit(e, 'support')} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Registered Support Email</label>
                  <input
                    type="email"
                    required
                    placeholder="support@sugora.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Employee Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold tracking-wide active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-indigo-100"
                  >
                    Access Agent Console
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('support')}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white py-3 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-md text-center"
                  >
                     ⚡ Direct Support Desk Access
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('/')}
                    className="w-full rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 py-2 text-[10px] font-bold transition text-center cursor-pointer border border-slate-200"
                  >
                    ← Back to General Entrance
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STANDARD CLIENT ONBOARDING */
            <div id="general-signin-gate" className="w-full max-w-sm my-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(79,70,229,0.06)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.1)] transition-all duration-300 space-y-6 relative z-10 animate-fade-in">
              
              <div className="text-center flex flex-col items-center">
                <div className="mb-3 transition-transform hover:scale-102">
                  <SugoraLogo className="h-11" />
                </div>
                <p className="text-xs text-slate-450 font-sans tracking-wide font-medium">Turn Time Into Value</p>

                {/* Connection Status Indicator */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] tracking-wider font-extrabold uppercase bg-indigo-50 text-indigo-750 border border-indigo-100/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') 
                    ? 'Cloud Active Mode' 
                    : 'Sandbox Engine Active'}
                </div>
              </div>

              {/* Mode Selection */}
              <div className="flex bg-slate-100/85 p-1.5 rounded-2xl border border-slate-200/50">
                <button 
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                  className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${authMode === 'signin' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-155 cursor-pointer ${authMode === 'signup' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Sign Up
                </button>
              </div>

              {authError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/80 p-3.5 text-xs text-rose-700 font-medium">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={authMode === 'signin' ? (e) => handleSignInSubmit(e, 'user') : handleSignUpSubmit} className="space-y-4 font-sans">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-505 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Sugora Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-xs font-mono text-slate-400">sugora.com/u/</span>
                        <input
                          type="text"
                          required
                          placeholder="username"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full rounded-2xl bg-slate-50 border border-slate-200 pl-[94px] pr-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-505 text-slate-800 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@sugora.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-505 text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-505 text-slate-800 transition"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 text-center">Select Profile Photo</label>
                    <div className="flex justify-center gap-4 mb-3">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', 
                        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                      ].map(img => (
                        <button
                          type="button"
                          key={img}
                          onClick={() => setAvatarInput(img)}
                          className={`rounded-full p-0.5 border-2 transition ${
                            avatarInput === img ? 'border-indigo-650 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img referrerPolicy="no-referrer" src={img} alt="avatar option" className="h-10 w-10 rounded-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste custom image URL..."
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-505 text-slate-800"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 py-3 text-xs font-semibold text-white tracking-wide active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isAuthLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                      Authenticating...
                    </span>
                  ) : (
                    authMode === 'signin' ? 'Sign In to Client Portal' : 'Create Sugora Account & Claim ₹100'
                  )}
                </button>
              </form>

              {/* Authorized Personnel gateways */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5 text-center">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">🔒 Authorized Personnel Gateway</span>
                <div className="flex gap-2.5 justify-center w-full">
                  <button
                    type="button"
                    onClick={() => navigateTo('/admin')}
                    className="flex-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-650 px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-205 hover:border-indigo-200 transition-all cursor-pointer text-center"
                  >
                    👑 Admin Terminal
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/supporting')}
                    className="flex-1 text-[10px] font-extrabold text-slate-500 hover:text-purple-600 px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-205 hover:border-purple-200 transition-all cursor-pointer text-center"
                  >
                    🎫 Support Desk
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* CORE ACTIVE CHASSIS LAYOUT */
        <>
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
                    <button
                      onClick={handleSignOut}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-350 cursor-pointer block text-left font-bold underline leading-none mt-0.5"
                    >
                      Sign Out
                    </button>
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
                <span className="block text-[9.5px] text-gray-500 dark:text-zinc-400 font-extrabold uppercase tracking-widest px-3 mb-2.5">
                  {profile.role === 'admin' 
                    ? '⚙️ System Control Cabinet' 
                    : profile.role === 'support' 
                      ? '🎫 Support Desk Operations' 
                      : 'Creator Suite Workspace'}
                </span>
                
                {profile.role === 'admin' ? (
                  // ADMIN PANELS DIRECT VIEW
                  [
                    { id: 'stats', label: 'Dashboard', icon: BarChart2 },
                    { id: 'users', label: 'Users Map', icon: Users },
                    { id: 'kyc', label: 'KYC Panel', icon: ShieldAlert },
                    { id: 'shop', label: 'Inventory', icon: ShoppingCart },
                    { id: 'branding', label: 'Branding', icon: Settings },
                    { id: 'pages', label: 'Page Builder', icon: Layout }
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = activeTab === 'admin' && adminSubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminSubTab(item.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450 border-l-2 border-rose-500 font-bold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850/40'
                        }`}
                      >
                        <IconComp className="h-4.5 w-4.5 shrink-0 text-rose-550" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })
                ) : profile.role === 'support' ? (
                  // SUPPORT FILTER PANELS DIRECT VIEW
                  [
                    { id: 'all', label: 'All Tickets', icon: HelpCircle },
                    { id: 'open', label: 'Open Tickets', icon: AlertTriangle },
                    { id: 'assigned', label: 'Assigned Tickets', icon: Clock },
                    { id: 'resolved', label: 'Resolved Tickets', icon: CheckCircle }
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = activeTab === 'support' && supportFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab('support');
                          setSupportFilter(item.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 text-teal-850 dark:bg-teal-950/20 dark:text-teal-400 border-l-2 border-teal-500 font-bold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850/40'
                        }`}
                      >
                        <IconComp className="h-4.5 w-4.5 shrink-0 text-teal-550" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })
                ) : (
                  // REGULAR USER CREATOR PANELS
                  [
                    { id: 'dashboard', label: 'General Dashboard', icon: LayoutDashboard },
                    { id: 'tree', label: 'Sugora Tree', icon: Share2 },
                    { id: 'chat', label: 'Sugora Chat', icon: MessageSquare },
                    { id: 'shop', label: 'Sugora Shop', icon: ShoppingBag },
                    { id: 'apps', label: 'Sugora Apps', icon: AppWindow },
                    { id: 'ai', label: 'AI Chat', icon: Sparkles },
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
                        <span>{item.label}</span>
                      </button>
                    );
                  })
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
                      activeSubTab={adminSubTab}
                      onSubTabChange={setAdminSubTab}
                    />
                  )}

                  {activeTab === 'support' && (profile.role === 'support' || profile.role === 'admin') && (
                    <SupportConsole
                      tickets={ticketsList}
                      onResolveTicket={handleResolveSupportTicket}
                      selectedFilter={supportFilter}
                      onFilterChange={setSupportFilter}
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
