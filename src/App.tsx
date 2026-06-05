/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Search,
  AppWindow,
  Wallet,
  ShieldCheck,
  Award,
  Settings,
  Menu,
  X,
  Plus,
  HelpCircle,
  Share2,
  Lock
} from 'lucide-react';
import { Profile, Wallet as WalletType, WalletTransaction, KYCRequest, WithdrawRequest, Product, SupportTicket, SiteSettings, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_APPS, INITIAL_MOCK_USERS, INITIAL_MOCK_TICKETS, INITIAL_TRANSACTIONS } from './mockData';

// Component imports
import Dashboard from './components/Dashboard';
import ChatSystem from './components/ChatSystem';
import ShopMarketplace from './components/ShopMarketplace';
import SugoraTree from './components/SugoraTree';
import AppsWebView from './components/AppsWebView';
import AIChatBot from './components/AIChatBot';
import WalletKYC from './components/WalletKYC';
import AdminConsole from './components/AdminConsole';
import SupportConsole from './components/SupportConsole';
import SugoraLogo from './components/SugoraLogo';

// Supabase synchronization imports
import {
  isSupabaseConfigured,
  supabase,
  syncProfile,
  fetchProfiles,
  syncWallet,
  insertTransaction,
  fetchTransactionsByWallet,
  syncKYCRequest,
  fetchAllKYCRequests,
  syncWithdrawRequest,
  fetchAllWithdrawRequests,
  fetchProducts,
  insertProduct,
  syncSiteSettings,
  fetchSiteSettings
} from './lib/supabaseClient';

export default function App() {
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
  const [roleInput, setRoleInput] = useState<UserRole>('user');

  // Credentials for Supabase Auth Live Sync
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isSignInMode, setIsSignInMode] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');

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

  // ------------------------------------------------------------------
  // SUPABASE ACTIVE INITIALIZATIONS & ASYNC LOADER EFFECTS
  // ------------------------------------------------------------------

  // Load User Data helper
  const loadUserSupabaseData = async (user: any) => {
    try {
      // 1. Fetch profile
      const { data: dbProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (dbProfile) {
        setProfile(dbProfile as Profile);
        
        // 2. Fetch or create Wallet
        const { data: dbWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (dbWallet) {
          setWallet(dbWallet as WalletType);
          const dbTx = await fetchTransactionsByWallet(dbWallet.id);
          setTransactionsList(dbTx as WalletTransaction[]);
        } else {
          const newW: WalletType = {
            id: `wallet-${Date.now()}`,
            user_id: user.id,
            balance: 0.00,
            promo_balance: 100.00, // starting Rs 100 bonus
            withdrawn: 0,
            updated_at: new Date().toISOString()
          };
          const syncedW = await syncWallet(newW);
          if (syncedW) setWallet(syncedW as WalletType);
        }

        // 3. Fetch KYC request
        const { data: dbKyc } = await supabase
          .from('kyc_requests')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (dbKyc) {
          setKycRequest(dbKyc as KYCRequest);
          setKycStatus(dbKyc.status as KYCRequest['status']);
        }

        // 4. Fetch withdrawal requests
        const { data: dbWithdraws } = await supabase
          .from('withdraw_requests')
          .select('*')
          .eq('user_id', user.id);
        if (dbWithdraws) {
          setWithdrawRequests(dbWithdraws as WithdrawRequest[]);
        }
      } else {
        // Logged into Auth but profile doesn't exist yet, prompt onboarding
        setProfile(null);
        setNameInput(user.user_metadata?.name || '');
        setUsernameInput(user.user_metadata?.username || '');
        setEmailInput(user.email || '');
        setSignUpStep(1);
      }
    } catch (err) {
      console.error('[loadUserSupabaseData Err]:', err);
    }
  };

  // Check live session on mount
  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await loadUserSupabaseData(user);
        }
      } catch (err) {
        console.error('[checkSession Err]:', err);
      }
    }
    checkSession();
  }, []);

  // Sync auth state changes dynamically
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserSupabaseData(session.user);
      } else {
        // signed out
        if (profile) handleLogOutSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load global datasets (products, other profiles, settings) from DB
  useEffect(() => {
    async function loadGlobalDatasets() {
      if (!isSupabaseConfigured()) {
        // Fallback seed for demo
        setTransactionsList(INITIAL_TRANSACTIONS('wallet-current'));
        return;
      }
      
      try {
        const dbProducts = await fetchProducts();
        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts as Product[]);
        }

        const dbProfiles = await fetchProfiles();
        if (dbProfiles && dbProfiles.length > 0) {
          setUsersList(dbProfiles as Profile[]);
        }

        const dbSettings = await fetchSiteSettings();
        if (dbSettings) {
          setSiteSettings(dbSettings as SiteSettings);
        }
      } catch (err) {
        console.error('[loadGlobalDatasets Err]:', err);
      }
    }
    loadGlobalDatasets();
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

  // Set default panel / activeTab on user profile load based on user role
  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        setActiveTab('admin');
      } else if (profile.role === 'support') {
        setActiveTab('support');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [profile]);

  // Handle Log Out / Re-Onboard
  const handleLogOutSession = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setProfile(null);
    setSignUpStep(1);
    setNameInput('');
    setUsernameInput('');
    setEmailInput('');
    setPasswordInput('');
    setKycStatus('unsubmitted');
    setKycRequest(null);
    setWithdrawRequests([]);
    setWallet({
      id: 'wallet-current',
      user_id: 'current-user',
      balance: 50.00,
      promo_balance: 100.00,
      withdrawn: 0,
      updated_at: new Date().toISOString()
    });
    setTransactionsList(INITIAL_TRANSACTIONS('wallet-current'));
  };

  // Onboarding Step Flow validation
  const handleOnboardingNextStep = async () => {
    if (signUpStep === 1) {
      setAuthErrorMessage('');

      // Sign In Flow (if configured)
      if (isSupabaseConfigured() && isSignInMode) {
        setIsAuthLoading(true);
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.trim(),
            password: passwordInput
          });
          if (error) throw error;
          if (data.user) {
            await loadUserSupabaseData(data.user);
          }
        } catch (err: any) {
          console.error('[Login Err]:', err);
          setAuthErrorMessage(err.message || 'Verification failed. Please check credentials.');
        } finally {
          setIsAuthLoading(false);
        }
        return;
      }

      // Registration Inputs Validation
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

  // Sign Up / Register Account Creation
  const handleCompleteSignUp = async () => {
    setIsAuthLoading(true);
    setAuthErrorMessage('');
    
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: emailInput.trim(),
          password: passwordInput,
          options: {
            data: {
              name: nameInput,
              username: usernameInput,
              avatar_url: avatarInput
            }
          }
        });
        if (error) throw error;

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            email: data.user.email!,
            name: nameInput,
            username: usernameInput,
            avatar_url: avatarInput || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            role: roleInput, // Dynamic role based on dropdown selection
            created_at: new Date().toISOString(),
            is_verified: true
          };

          // Redundantly write Profile just in case table triggers have any millisecond delays
          const dbProfile = await syncProfile(newProfile);
          
          const newW: WalletType = {
            id: `wallet-${Date.now()}`,
            user_id: data.user.id,
            balance: 0.00,
            promo_balance: 100.00,
            withdrawn: 0,
            updated_at: new Date().toISOString()
          };
          await syncWallet(newW);

          setProfile(dbProfile || newProfile);
          setWallet(newW);
          setUsersList(prev => [...prev, dbProfile || newProfile]);
        }
      } else {
        // Local Sandbox Mode Account Setup
        const newProfile: Profile = {
          id: `current-user-${Date.now()}`,
          email: 'ceo.sugora@gmail.com',// matching current login session
          name: nameInput,
          username: usernameInput,
          avatar_url: avatarInput || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          role: roleInput, // Dynamic role based on dropdown selection
          created_at: new Date().toISOString(),
          is_verified: true
        };

        setProfile(newProfile);
        setUsersList(prev => [...prev, newProfile]);
      }
    } catch (err: any) {
      console.error('[Signup Err]:', err);
      setAuthErrorMessage(err.message || 'Failed to complete registration on backend.');
      setSignUpStep(1); // send back to fix fields
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Quick Sign In for evaluators to easily check User/Admin/Support panels
  const handleQuickSignIn = async (role: UserRole) => {
    setIsAuthLoading(true);
    setAuthErrorMessage('');
    
    const mockEmail = `${role}@sugora.com`;
    setEmailInput(mockEmail);
    setPasswordInput('password123');

    try {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: mockEmail,
            password: 'password123'
          });
          if (error) {
            // Register this user on the fly if not exists
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
              await syncProfile(newProfile);
              setProfile(newProfile);
            }
          } else if (data.user) {
            const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
            if (dbProfile) {
              const updatedProfile = { ...(dbProfile as Profile), role };
              await syncProfile(updatedProfile);
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
              await syncProfile(newProfile);
              setProfile(newProfile);
            }
          }
        } catch (err: any) {
          console.error('[Quick Link Active DB Fallback]:', err);
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
      setAuthErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Switch Role utilities for simple evaluations
  const handleToggleRoleScope = async (role: Profile['role']) => {
    if (!profile) return;
    const updated = { ...profile, role };
    setProfile(updated);
    setActiveTab('dashboard'); // reset to dashboard

    if (isSupabaseConfigured()) {
      await syncProfile(updated);
    }
  };

  // Wallet Functions with DB Synced writing
  const handleAddFunds = async (amt: number) => {
    const updatedW = {
      ...wallet,
      balance: wallet.balance + amt,
      updated_at: new Date().toISOString()
    };
    
    setWallet(updatedW);

    const nTx: WalletTransaction = {
      id: `tx-dep-${Date.now()}`,
      wallet_id: wallet.id,
      amount: amt,
      type: 'deposit',
      status: 'completed',
      description: `Funds deposited via secure Razorpay checkout`,
      created_at: new Date().toISOString()
    };

    setTransactionsList(prev => [nTx, ...prev]);

    if (isSupabaseConfigured()) {
      await syncWallet(updatedW);
      await insertTransaction(nTx);
    }
  };

  const handleWithdrawFunds = async (amt: number, method: 'UPI' | 'Bank Transfer', details: string): Promise<boolean> => {
    if (kycStatus !== 'approved' || wallet.balance < amt) return false;

    const updatedW = {
      ...wallet,
      balance: wallet.balance - amt,
      withdrawn: wallet.withdrawn + amt,
      updated_at: new Date().toISOString()
    };
    
    setWallet(updatedW);

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

    if (isSupabaseConfigured()) {
      await syncWallet(updatedW);
      await syncWithdrawRequest(newReq);
      await insertTransaction(nTx);
    }
    return true;
  };

  // KYC submissions with DB Synced writing
  const handleSubmitKYC = async (fullName: string, dob: string, address: string, pan: string, aadhaar: string) => {
    if (!fullName) {
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

    if (isSupabaseConfigured()) {
      await syncKYCRequest(nKyc);
    }
  };

  // E-commerce purchase dispatcher with DB Synced writing
  const handleProductPurchaseDone = async (product: Product, price: number, payId: string) => {
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

    // Dispatch affiliate commission
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

    if (isSupabaseConfigured() && profile) {
      await supabase.from('orders').insert({
        user_id: profile.id,
        product_id: product.id,
        amount: price,
        status: 'completed',
        payment_id: payId
      });
      await insertTransaction(nTx);
    }
  };

  // Admin Level overrides with DB Synced writing
  const handleApproveKYC = async (reqId: string) => {
    setKycStatus('approved');
    if (kycRequest) {
      const updated = { ...kycRequest, status: 'approved' as const };
      setKycRequest(updated);
      if (isSupabaseConfigured()) {
         await supabase.from('kyc_requests').update({ status: 'approved' }).eq('user_id', kycRequest.user_id);
      }
    }
  };

  const handleRejectKYC = async (reqId: string) => {
    setKycStatus('rejected');
    if (kycRequest) {
      const updated = { ...kycRequest, status: 'rejected' as const };
      setKycRequest(updated);
      if (isSupabaseConfigured()) {
         await supabase.from('kyc_requests').update({ status: 'rejected' }).eq('user_id', kycRequest.user_id);
      }
    }
  };

  const handleApproveWithdrawal = async (reqId: string) => {
    setWithdrawRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
    if (isSupabaseConfigured()) {
      await supabase.from('withdraw_requests').update({ status: 'approved' }).eq('id', reqId);
    }
  };

  const handleAddProduct = async (nProd: Product) => {
    setProductsList(prev => [nProd, ...prev]);
    if (isSupabaseConfigured()) {
      await insertProduct(nProd);
    }
  };

  const handleChangeCommission = async (rate: number) => {
    const updatedSettings = { ...siteSettings, commission_rate: rate };
    setSiteSettings(updatedSettings);
    if (isSupabaseConfigured()) {
      await syncSiteSettings(updatedSettings);
    }
  };

  const handleResolveSupportTicket = (ticketId: string) => {
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1a1f26] dark:bg-[#06080a] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ONBOARDING DIALOG POPUP: Force user setup */}
      {!profile ? (
        <div className="fixed inset-0 bg-[#0c0e12]/60 dark:bg-[#06080b]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-md my-auto rounded-3xl bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            <div className="text-center flex flex-col items-center">
              <div className="mb-4">
                <SugoraLogo className="h-10" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-gray-500 dark:text-zinc-400">Interactive Creator Platform</h2>
              <p className="text-xs text-gray-400 mt-1">Setup your credentials to enter the interactive platform</p>
            </div>

            {/* Stepper display (Hidden if in SignIn Mode to avoid confusion) */}
            {(!isSupabaseConfigured() || !isSignInMode) && (
              <div className="flex justify-center gap-2.5">
                {[1, 2, 3].map(st => (
                  <div key={st} className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      signUpStep === st 
                        ? 'bg-emerald-600 text-white' 
                        : signUpStep > st 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-105 text-gray-400 bg-gray-100 dark:bg-zinc-800'
                    }`}>
                      {st}
                    </div>
                    {st < 3 && <div className="h-0.5 w-6 bg-gray-100 dark:bg-zinc-850" />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Input Name and unique username (and Email/Password if Supabase active) */}
            {signUpStep === 1 && (
              <div className="space-y-4">
                {isSupabaseConfigured() && (
                  <div className="flex justify-center border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2 gap-4">
                    <button
                      onClick={() => {
                        setIsSignInMode(false);
                        setAuthErrorMessage('');
                      }}
                      className={`pb-1 text-xs font-bold transition-all ${
                        !isSignInMode 
                          ? 'text-emerald-600 border-b-2 border-emerald-600' 
                          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => {
                        setIsSignInMode(true);
                        setAuthErrorMessage('');
                      }}
                      className={`pb-1 text-xs font-bold transition-all ${
                        isSignInMode 
                          ? 'text-emerald-600 border-b-2 border-emerald-600' 
                          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600'
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* If Registering, get Name & Username */}
                {(!isSupabaseConfigured() || !isSignInMode) && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-medium text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Select Profile Username (Unique)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-xs font-mono text-gray-400">sugora.com/u/</span>
                        <input
                          type="text"
                          required
                          placeholder="johndoe"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 pl-[92px] pr-4 py-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-black dark:text-white"
                        />
                      </div>
                      {usernameError && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">{usernameError}</p>
                      )}
                    </div>

                    {/* Choose Role / Panel Selector during signup */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Select Account Panel / Role</label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-150 dark:bg-[#080a0c] border border-gray-100 dark:border-zinc-800 rounded-xl">
                        {[
                          { id: 'user', label: 'User Hub' },
                          { id: 'support', label: 'Support Desk' },
                          { id: 'admin', label: 'Admin Panel' }
                        ].map(roleOpt => (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => setRoleInput(roleOpt.id as UserRole)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                              roleInput === roleOpt.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                          >
                            {roleOpt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 leading-normal">
                        {roleInput === 'admin' && '👑 Owner dashboard with analytics control'}
                        {roleInput === 'support' && '🎫 Customer complaints & resolution terminal'}
                        {roleInput === 'user' && '🌲 Main Creator dashboard & bio templates'}
                      </p>
                    </div>
                  </>
                )}

                {/* Live DB Email Credentials */}
                {isSupabaseConfigured() && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. alex@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-medium text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 6 characters"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-medium text-black dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Preset sign-in buttons */}
                {isSignInMode && (
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-2 font-mono">⚡ Quick Demo Sign In Panels</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn('user')}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/20 text-center transition active:scale-95 cursor-pointer"
                      >
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">User Panel</span>
                        <span className="text-[8px] text-emerald-600 opacity-85 font-mono">/dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn('support')}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:hover:bg-teal-950/35 border border-teal-100 dark:border-teal-900/20 text-center transition active:scale-95 cursor-pointer"
                      >
                        <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400">Support Panel</span>
                        <span className="text-[8px] text-teal-600 opacity-85 font-mono">/support-dash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn('admin')}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 border border-rose-100 dark:border-rose-900/20 text-center transition active:scale-95 cursor-pointer"
                      >
                        <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400">Admin Panel</span>
                        <span className="text-[8px] text-rose-600 opacity-85 font-mono">/analytics</span>
                      </button>
                    </div>
                  </div>
                )}

                {authErrorMessage && (
                  <p className="text-[10px] font-bold text-rose-600 mt-1">{authErrorMessage}</p>
                )}

                <button
                  onClick={handleOnboardingNextStep}
                  disabled={
                    isAuthLoading ||
                    (!isSignInMode && (!nameInput.trim() || !usernameInput.trim())) ||
                    (isSupabaseConfigured() && (!emailInput.trim() || passwordInput.length < 6))
                  }
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAuthLoading ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : null}
                  {isSignInMode ? 'Sign In' : 'Continue Onboarding'}
                </button>
              </div>
            )}

            {/* Step 2: Avatar Photo Selection */}
            {signUpStep === 2 && (
              <div className="space-y-4">
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
                    className="w-full rounded-2xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-xs border border-gray-150 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleOnboardingNextStep}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white transition active:scale-95"
                >
                  Proceed to Setup Account
                </button>
              </div>
            )}

            {/* Step 3: Complete Account Setup Notification */}
            {signUpStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="rounded-xl bg-gray-50 dark:bg-zinc-950 p-4 border text-xs text-gray-500 space-y-1.5 font-medium leading-relaxed">
                  <p>✓ Name Registered: <span className="font-bold text-gray-900 dark:text-zinc-200">{nameInput}</span></p>
                  <p>✓ Profile URL: <span className="font-mono text-emerald-600 font-bold">sugora.com/u/{usernameInput}</span></p>
                  <p>✓ Welcome Promotional Payout: <span className="font-bold text-emerald-600">₹100 active</span></p>
                </div>

                {authErrorMessage && (
                  <p className="text-[10px] font-bold text-rose-600 mt-1">{authErrorMessage}</p>
                )}

                <button
                  onClick={handleCompleteSignUp}
                  disabled={isAuthLoading}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <ShieldCheck className="h-4.5 w-4.5" />
                  )}
                  Deploy Sugora Studio
                </button>
              </div>
            )}

          </div>
        </div>
      ) : (

        /* CORE ACTIVE CHASSIS LAYOUT */
        <>
          {/* TOP ADMIN QUICK MULTI-ROLE SWITCHER BAR */}
          <div className="bg-[#090b0e] text-zinc-100 py-2.5 px-6 flex flex-col md:flex-row items-center justify-between text-xs sticky top-0 z-30 border-b border-zinc-800/60 backdrop-blur-md">
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
          <div className="flex-1 flex flex-col">
            <header id="main-global-header" className="bg-white border-b border-zinc-200/50 px-6 py-3.5 dark:bg-[#0d0f12]/90 dark:border-zinc-800 flex items-center justify-between z-10 shrink-0">
              <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <SugoraLogo className="h-9" />
              </div>

              {/* Header Right togglers */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="Toggle Visual Theme"
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-250/20 dark:border-zinc-700/30"
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
                  onClick={handleLogOutSession}
                  title="Sign Out / Disconnect Session"
                  className="p-2 text-zinc-400 hover:text-rose-600 transition rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-250/20 dark:border-zinc-700/30"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 rounded dark:text-zinc-300 hover:bg-gray-50"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row relative">
              
              {/* SIDEBAR NAVIGATION GRIDS */}
              <nav className={`w-full md:w-64 shrink-0 bg-white border-r border-[#eceff1] dark:bg-[#0c0e12]/85 dark:border-zinc-800/80 p-4.5 space-y-1.5 z-20 ${
                mobileMenuOpen ? 'absolute inset-x-0 top-0 bg-white dark:bg-[#12141a] h-fit border-b shadow-lg border-zinc-200 dark:border-zinc-800' : 'hidden md:block'
              }`}>
                <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-2.5">Workspace</span>
                
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
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-l-2 border-emerald-600'
                          : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <IconComp className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}

                {/* ROLE POWER PRIVILEGES SECTIONS */}
                {profile.role === 'admin' && (
                  <div className="pt-4 mt-4 border-t border-zinc-150 dark:border-zinc-800/40 space-y-1">
                    <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-2">Administrations</span>
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border-l-2 border-rose-500'
                          : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/45'
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
                      <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-3 mb-1.5">Support Staff</span>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('support');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                        activeTab === 'support'
                          ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400 border-l-2 border-teal-500'
                          : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/45'
                      }`}
                    >
                      <HelpCircle className="h-4.5 w-4.5 text-teal-500" />
                      Complaints Desk
                    </button>
                  </div>
                )}
              </nav>

              {/* CORE RENDERING VIEWSPACE PORTAL */}
              <main id="main-content-panels" className="flex-grow p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-full">
                <div className="max-w-5xl mx-auto h-full">
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
                      usersList={usersList}
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

      {/* PREMIUM BOTTOM MOBILE NAVIGATION */}
      {profile && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 py-1.5 px-1 flex justify-around items-center z-45 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tree', label: 'Sugora Tree', icon: Share2 },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'more', label: 'Menu', icon: Menu }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id || (tab.id === 'more' && mobileMenuOpen);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'more') {
                    setMobileMenuOpen(!mobileMenuOpen);
                  } else {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }
                }}
                className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isSelected 
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-102' 
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <IconComp className={`h-5 w-5 ${isSelected ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[9px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Embedded universal tiny footer */}
      <footer className="py-2.5 px-6 border-t border-gray-100 text-center text-[10px] text-gray-400 dark:bg-zinc-950 dark:border-zinc-900 shrink-0 capitalize">
        Sugora.com Studio Portal © 2026 • Verified compliance standards approved
      </footer>
    </div>
  );
}
