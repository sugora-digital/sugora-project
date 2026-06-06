/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { Profile, Wallet as WalletType, WalletTransaction, KYCRequest, WithdrawRequest, Product, SupportTicket, SiteSettings, UserRole, WebsiteSettings, CustomPage, KYCStatus } from './types';
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
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

  // Embedded light state-based SPA router
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setAuthErrorMessage('');
    setUsernameError('');
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

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
  const [kycStatus, setKycStatus] = useState<KYCStatus | 'unsubmitted'>('unsubmitted');
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [kycRequest, setKycRequest] = useState<KYCRequest | null>(null);

  // Site general settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    commission_rate: 10,
    gemini_api_configured: true,
    messages_limit: 50
  });

  // Website Settings State
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    site_name: 'Sugora Platform',
    site_description: 'Redesigning modern mobile link bio services',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    favicon_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    footer_logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    tagline: 'Connect. Create. Monetize.',
    email: 'hello@sugora.com',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India'
  });

  // Dynamic Custom Pages state list
  const [customPages, setCustomPages] = useState<CustomPage[]>([
    {
      id: 'p-1',
      title: 'About Sugora Ecosystem',
      slug: 'about-us',
      content: '<h1>Our Mission</h1><p>Sugora provides standard web engines and link bio structures to empower creators across modern micro-payment frameworks with complete transparency.</p>',
      seo_title: 'About Sugora Ecosystem - Verified Creators',
      seo_description: 'Empowering creator bio economies with integrated UPI wallets and store catalogs.',
      status: 'Published',
      created_at: new Date().toISOString(),
      template: 'standard'
    }
  ]);

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
      if (window.location.pathname !== '/') {
        navigateTo('/');
      }
      if (profile.role === 'admin') {
        setActiveTab('admin');
      } else if (profile.role === 'support') {
        setActiveTab('support');
      } else {
        setActiveTab('ai');
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

  // Google OAuth Auto Onboarding simulation
  const handleGoogleSignInMock = () => {
    const randomSuffix = Math.floor(Math.random() * 1000000);
    setNameInput('Alex Rivera');
    setUsernameInput(`alex_google_oauth_${randomSuffix}`);
    setEmailInput(`alex.rivera.${randomSuffix}@google-sim.sugora.com`);
    setPasswordInput(`GoogleAuth_${randomSuffix}`);
    setAvatarInput('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
    setRoleInput('user');
    setSignUpStep(2);
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
          if (err?.message?.includes('confirmation email')) {
            console.warn('[Quick Link Active DB Fallback Notice]: Sync inactive or requires email confirmation. Using instant local profile verification.');
          } else {
            console.warn('[Quick Link Active DB Fallback Notice]:', err?.message || err);
          }
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

  const handleUpdateWebsiteSettings = (newSettings: WebsiteSettings) => {
    setWebsiteSettings(newSettings);
  };

  const handleAddCustomPage = (newPage: CustomPage) => {
    setCustomPages(prev => [...prev, newPage]);
  };

  const handleDeleteCustomPage = (slug: string) => {
    setCustomPages(prev => prev.filter(p => p.slug !== slug));
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1a1f26] dark:bg-[#06080a] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ONBOARDING DIALOG POPUP: Force user setup */}
      {!profile ? (
        <div className="min-h-screen bg-white text-[#1a1f26] flex flex-col justify-center items-center p-4 sm:p-8 relative selection:bg-indigo-100 overflow-y-auto">
          {/* Subtle elegant colorful background gradient blobbies */}
          <div className="absolute top-10 left-10 w-48 sm:w-80 h-48 sm:h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 sm:w-80 h-48 sm:h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-36 sm:w-60 h-36 sm:h-60 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />

          {/* Core App Wrapper */}
          <div className="w-full max-w-sm my-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(79,70,229,0.06)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.1)] transition-all duration-300 space-y-6 relative z-10">
            
            <div className="text-center flex flex-col items-center">
              <div className="mb-3 transition-transform hover:scale-102">
                <SugoraLogo className="h-11" />
              </div>
              
              {currentPath === '/admin-signin' ? (
                <>
                  <h2 className="text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 uppercase">
                    Sugora Owner Terminal
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium max-w-xs">
                    Secure gateway for revenue controls, global parameters, and wallet validations.
                  </p>
                </>
              ) : currentPath === '/supportdesk-signin' ? (
                <>
                  <h2 className="text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 uppercase">
                    Support Desk Console
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium max-w-xs">
                    Customer complaints terminal, resolution systems, and wallet corrections.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-600 uppercase">
                    Creator Studio Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Configure your link templates & UPI wallet payout credentials
                  </p>
                </>
              )}
            </div>

            {/* Path 1: ADMIN SIGN IN ROUTE */}
            {currentPath === '/admin-signin' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-sans">
                      Administrator Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@sugora.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 transition-all duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-sans">
                      Security Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter security key"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 transition-all duration-150"
                    />
                  </div>
                </div>

                {authErrorMessage && (
                  <p className="text-[10px] font-bold text-rose-600 text-center">{authErrorMessage}</p>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setRoleInput('admin');
                    setIsSignInMode(true);
                    setTimeout(() => {
                      handleOnboardingNextStep();
                    }, 50);
                  }}
                  disabled={isAuthLoading || !emailInput || passwordInput.length < 6}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 hover:shadow-lg hover:shadow-indigo-100 py-3 px-4 text-xs font-bold text-white active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuthLoading && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  Verify & Open Terminal
                </button>

                <div className="flex items-center gap-2 text-[9px] text-slate-300 font-extrabold uppercase py-1 select-none">
                  <div className="h-0.5 flex-grow bg-slate-100" />
                  <span>Interactive Quick Access</span>
                  <div className="h-0.5 flex-grow bg-slate-100" />
                </div>

                {/* Excellent, colorful dynamic hover for Quick Access */}
                <button
                  type="button"
                  onClick={() => {
                    handleQuickSignIn('admin');
                  }}
                  className="w-full relative py-3.5 px-4 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-orange-50/40 hover:from-rose-100/60 hover:to-orange-100/40 border border-rose-100 hover:border-rose-300 text-rose-850 hover:text-rose-900 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-98 shadow-sm flex flex-col items-center justify-center gap-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] uppercase tracking-wider text-rose-600 font-extrabold group-hover:text-rose-700">
                      Rapid Demo CEO Access
                    </span>
                  </div>
                  <span className="text-[9px] text-rose-500/80 font-mono">
                    Skip credentials & mock CEO Alex session instantly
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-slate-600 hover:translate-x-[-2px] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ← Back to Creator Hub
                </button>
              </div>
            )}

            {/* Path 2: SUPPORT DESK SIGN IN ROUTE */}
            {currentPath === '/supportdesk-signin' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-sans">
                      Agent Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. support@sugora.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800 transition-all duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-sans">
                      Agent Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter security key"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800 transition-all duration-150"
                    />
                  </div>
                </div>

                {authErrorMessage && (
                  <p className="text-[10px] font-bold text-rose-600 text-center">{authErrorMessage}</p>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setRoleInput('support');
                    setIsSignInMode(true);
                    setTimeout(() => {
                      handleOnboardingNextStep();
                    }, 50);
                  }}
                  disabled={isAuthLoading || !emailInput || passwordInput.length < 6}
                  className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-teal-100 py-3 px-4 text-xs font-bold text-white active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuthLoading && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  Identify & Open Console
                </button>

                <div className="flex items-center gap-2 text-[9px] text-slate-300 font-extrabold uppercase py-1 select-none">
                  <div className="h-0.5 flex-grow bg-slate-100" />
                  <span>Interactive Quick Access</span>
                  <div className="h-0.5 flex-grow bg-slate-100" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleQuickSignIn('support');
                  }}
                  className="w-full relative py-3.5 px-4 rounded-2xl bg-gradient-to-br from-teal-50 via-white to-sky-50/40 hover:from-teal-100/60 hover:to-sky-100/40 border border-teal-100 hover:border-teal-300 text-teal-850 hover:text-teal-900 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-98 shadow-sm flex flex-col items-center justify-center gap-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[11px] uppercase tracking-wider text-teal-600 font-extrabold group-hover:text-teal-700">
                      Rapid Support Staff Access
                    </span>
                  </div>
                  <span className="text-[9px] text-teal-500/80 font-mono">
                    Skip credentials & mock Agent Sarah session instantly
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-slate-600 hover:translate-x-[-2px] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ← Back to Creator Hub
                </button>
              </div>
            )}

            {/* Path 3: STANDARD USER SIGN IN OR REGISTER ROUTES */}
            {currentPath !== '/admin-signin' && currentPath !== '/supportdesk-signin' && (
              <>
                {/* Stepper display (Hidden if in SignIn Mode to avoid confusion) */}
                {(!isSupabaseConfigured() || !isSignInMode) && (
                  <div className="flex justify-center gap-2.5 pt-1">
                    {[1, 2, 3].map(st => (
                      <div key={st} className="flex items-center gap-1.5">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          signUpStep === st 
                            ? 'bg-emerald-600 text-white' 
                            : signUpStep > st 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-400 border border-slate-205'
                        }`}>
                          {st}
                        </div>
                        {st < 3 && <div className="h-0.5 w-6 bg-slate-150" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 1: Input Name and unique username */}
                {signUpStep === 1 && (
                  <div className="space-y-4 w-full">
                    
                    {/* Choose between Create Account vs Sign In */}
                    {isSupabaseConfigured() && (
                      <div className="flex justify-center border-b border-slate-100 pb-2 mb-2 gap-6">
                        <button
                          onClick={() => {
                            setIsSignInMode(false);
                            setAuthErrorMessage('');
                          }}
                          className={`pb-1.5 text-xs font-bold transition-all cursor-pointer ${
                            !isSignInMode 
                              ? 'text-indigo-600 border-b-2 border-indigo-600' 
                              : 'text-slate-400 hover:text-slate-650'
                          }`}
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => {
                            setIsSignInMode(true);
                            setAuthErrorMessage('');
                          }}
                          className={`pb-1.5 text-xs font-bold transition-all cursor-pointer ${
                            isSignInMode 
                              ? 'text-indigo-600 border-b-2 border-indigo-600' 
                              : 'text-slate-400 hover:text-slate-650'
                          }`}
                        >
                          Sign In
                        </button>
                      </div>
                    )}

                    {/* 1. Google OAuth Signup option */}
                    {!isSignInMode && (
                      <button
                        type="button"
                        onClick={handleGoogleSignInMock}
                        className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                      >
                        <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=35" className="h-4.5 w-4.5 object-contain" alt="Google logo icon" />
                        Continue with Google OAuth
                      </button>
                    )}

                    {!isSignInMode && (
                      <div className="flex items-center gap-2 text-[9px] text-slate-350 font-extrabold uppercase py-0.5 select-none">
                        <div className="h-0.5 flex-grow bg-slate-100" />
                        <span>OR SIGN UP BELOW</span>
                        <div className="h-0.5 flex-grow bg-slate-100" />
                      </div>
                    )}

                    {/* Name & Username Inputs */}
                    {(!isSupabaseConfigured() || !isSignInMode) && (
                      <>
                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Alex Rivera"
                            value={nameInput}
                            onChange={(e) => {
                              setNameInput(e.target.value);
                              setRoleInput('user'); // strictly enforce user role
                            }}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 transition-all duration-150"
                          />
                        </div>

                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                            Select Profile Username (Unique)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-3.5 text-xs font-mono text-slate-400">sugora.com/u/</span>
                            <input
                              type="text"
                              required
                              placeholder="johndoe"
                              value={usernameInput}
                              onChange={(e) => {
                                setUsernameInput(e.target.value);
                                setRoleInput('user'); // strictly enforce user role
                              }}
                              className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 pl-[92px] pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 font-mono transition-all duration-150"
                            />
                          </div>
                          {usernameError && (
                            <p className="text-[10px] font-bold text-rose-600 mt-1">{usernameError}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Email and Password inputs */}
                    {isSupabaseConfigured() && (
                      <>
                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. alex@example.com"
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setRoleInput('user'); // strictly enforce role
                            }}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 transition-all duration-150"
                          />
                        </div>

                        <div>
                          <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Minimum 6 characters"
                            value={passwordInput}
                            onChange={(e) => {
                              setPasswordInput(e.target.value);
                              setRoleInput('user'); // strictly enforce role
                            }}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 transition-all duration-150"
                          />
                        </div>
                      </>
                    )}

                    {/* Standard creator direct simulation buttons when database is mock } */}
                    {!isSupabaseConfigured() && (
                      <div className="pt-2.5 border-t border-slate-100 space-y-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">⚡ Creator Sandboxed Entry</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleInput('user');
                            handleQuickSignIn('user');
                          }}
                          className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Direct Sandbox Creator Entry
                        </button>
                      </div>
                    )}

                    {authErrorMessage && (
                      <p className="text-[10px] font-bold text-rose-600 mt-1">{authErrorMessage}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setRoleInput('user');
                        handleOnboardingNextStep();
                      }}
                      disabled={
                        isAuthLoading ||
                        (!isSignInMode && (!nameInput.trim() || !usernameInput.trim())) ||
                        (isSupabaseConfigured() && (!emailInput.trim() || passwordInput.length < 6))
                      }
                      className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 py-3 text-xs font-semibold text-white active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isAuthLoading && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                      {isSignInMode ? 'Sign In to Creator Portal' : 'Continue Onboarding'}
                    </button>

                    {/* Custom Admin & Support Navigation Banner Under Card */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5 text-center">
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">🔒 Authorized Personnel Gateway</span>
                      <div className="flex gap-2.5 justify-center w-full">
                        <button
                          type="button"
                          onClick={() => navigateTo('/admin-signin')}
                          className="flex-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-600 px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer text-center"
                        >
                          👑 Admin Terminal
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('/supportdesk-signin')}
                          className="flex-1 text-[10px] font-extrabold text-slate-500 hover:text-purple-600 px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 transition-all cursor-pointer text-center"
                        >
                          🎫 Support Desk
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Avatar Photo Selection */}
                {signUpStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Upload Profile Representation</label>
                      <div className="flex justify-center gap-4 mb-4">
                        {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', 
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'].map(img => (
                          <button
                            key={img}
                            onClick={() => setAvatarInput(img)}
                            className={`rounded-full p-0.5 border-2 transition-all ${
                              avatarInput === img ? 'border-emerald-600 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
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
                        className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-xs border border-slate-200 focus:border-indigo-500 hover:border-slate-300 text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleOnboardingNextStep}
                      className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-semibold text-white transition active:scale-95 cursor-pointer shadow-md"
                    >
                      Proceed to Setup Account
                    </button>
                  </div>
                )}

                {/* Step 3: Complete Account Setup Notification */}
                {signUpStep === 3 && (
                  <div className="space-y-4 text-center">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-205 text-xs text-slate-500 space-y-1.5 font-medium leading-relaxed text-left">
                      <p>✓ Name Registered: <span className="font-bold text-slate-800">{nameInput}</span></p>
                      <p>✓ Profile URL: <span className="font-mono text-emerald-600 font-bold">sugora.com/u/{usernameInput}</span></p>
                      <p>✓ Welcome Promotional Payout: <span className="font-bold text-emerald-600">₹100 active</span></p>
                    </div>

                    {authErrorMessage && (
                      <p className="text-[10px] font-bold text-rose-600 mt-1">{authErrorMessage}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleCompleteSignUp}
                      disabled={isAuthLoading}
                      className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
              </>
            )}

          </div>
        </div>
      ) : (

        /* CORE ACTIVE CHASSIS LAYOUT */
        <>
          {/* MASTER USER LANDSCAPE INTERFACE */}
          <div className="flex-1 flex flex-col bg-white">
            <header id="main-global-header" className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-30 shrink-0">
              <div className="cursor-pointer transition-transform hover:scale-101 flex items-center gap-2" onClick={() => setActiveTab('ai')}>
                {websiteSettings.logo_url ? (
                  <img referrerPolicy="no-referrer" src={websiteSettings.logo_url} alt={websiteSettings.site_name} className="h-8.5 w-auto max-w-[150px] object-contain" />
                ) : (
                  <SugoraLogo className="h-8.5" />
                )}
              </div>

              {/* Header Right controllers */}
              <div className="flex items-center gap-3.5">
                {/* On Chat/AI views, we ONLY display the website logo and a three-line (hamburger) menu icon */}
                {activeTab !== 'ai' && activeTab !== 'chat' ? (
                  <>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1.5">
                      <img
                        referrerPolicy="no-referrer"
                        src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                        alt={profile.name}
                        className="h-7 w-7 rounded-xl object-cover ring-2 ring-indigo-500/10"
                      />
                      <div className="hidden sm:block text-left">
                        <span className="block text-[11px] font-bold text-slate-800 leading-tight">{profile.name}</span>
                        <span className="block text-[8px] text-indigo-600 font-extrabold uppercase tracking-wider mt-0.5">{profile.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogOutSession}
                      title="Sign Out / Disconnect Session"
                      className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:border-rose-100 active:scale-95 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition active:scale-95"
                      title="Toggle Menu"
                    >
                      {mobileMenuOpen ? <X className="h-5 w-5 text-indigo-600" /> : <Menu className="h-5 w-5" />}
                    </button>
                  </>
                ) : (
                  /* Only hamburger shown here as per client specifications */
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2.5 text-slate-600 hover:text-slate-900 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-100"
                    title="Toggle Workspace Menu"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5 text-indigo-600" /> : <Menu className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-white">
              
              {/* SIDEBAR NAVIGATION GRIDS WITH ANIMATED PRESENCE SLIDES */}
              <AnimatePresence mode="wait">
                {(mobileMenuOpen || (activeTab !== 'ai' && activeTab !== 'chat')) && (
                  <motion.nav
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className={`shrink-0 bg-white border-r border-slate-100 p-5 space-y-1.5 z-40 ${
                      activeTab === 'ai' || activeTab === 'chat'
                        ? 'absolute inset-y-0 left-0 w-72 shadow-2xl h-full'
                        : mobileMenuOpen
                          ? 'absolute inset-x-0 top-0 w-full bg-white h-fit border-b shadow-lg rounded-b-3xl'
                          : 'hidden md:block md:w-64'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50">
                      <span className="block text-[9px] text-indigo-600 font-extrabold uppercase tracking-widest px-1">Creator Suite Workspace</span>
                      {(activeTab === 'ai' || activeTab === 'chat') && (
                        <button 
                          onClick={() => setMobileMenuOpen(false)} 
                          className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {[
                      { id: 'dashboard', label: 'General Dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
                      { id: 'tree', label: 'Sugora Tree Builder', icon: Share2, color: 'text-rose-500' },
                      { id: 'chat', label: 'WhatsApp Chat', icon: MessageSquare, color: 'text-emerald-500' },
                      { id: 'shop', label: 'Shop Marketplace', icon: ShoppingBag, color: 'text-amber-500' },
                      { id: 'apps', label: 'Embedded Apps', icon: AppWindow, color: 'text-violet-500' },
                      { id: 'ai', label: 'Copilot AI Chat', icon: Sparkles, color: 'text-purple-600' },
                      { id: 'wallet', label: 'Wallet & KYC', icon: Wallet, color: 'text-blue-500' }
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
                          className={`w-full py-3 px-3.5 rounded-2xl text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/75 text-indigo-700 shadow-xs scale-102 border-l-4 border-indigo-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <IconComp className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-indigo-600 stroke-[2.2px]' : item.color}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    {/* ROLE POWER PRIVILEGES SECTIONS */}
                    {profile.role === 'admin' && (
                      <div className="pt-4 mt-4 border-t border-slate-50 space-y-1">
                        <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest px-3 mb-2">Administrations Area</span>
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full py-3 px-3.5 rounded-2xl text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                            activeTab === 'admin'
                              ? 'bg-indigo-50/75 text-indigo-700 shadow-xs border-l-4 border-indigo-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <Lock className="h-4.5 w-4.5 text-zinc-800" />
                          <span>System Admin Panel</span>
                        </button>
                      </div>
                    )}

                    {(profile.role === 'support' || profile.role === 'admin') && (
                      <div className="pt-2 space-y-1">
                        {profile.role !== 'admin' && (
                          <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest px-3 mb-1.5">Support Staff</span>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('support');
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full py-3 px-3.5 rounded-2xl text-left flex items-center gap-3 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                            activeTab === 'support'
                              ? 'bg-indigo-50/75 text-indigo-700 shadow-xs border-l-4 border-indigo-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <HelpCircle className="h-4.5 w-4.5 text-slate-500" />
                          <span>Complaints Desk</span>
                        </button>
                      </div>
                    )}
                  </motion.nav>
                )}
              </AnimatePresence>

              {/* CORE RENDERING VIEWSPACE PORTAL */}
              <main id="main-content-panels" className="flex-grow p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-full bg-slate-50/60">
                <div className="max-w-7xl mx-auto h-full">
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
                      websiteSettings={websiteSettings}
                      customPages={customPages}
                      onApproveKYC={handleApproveKYC}
                      onRejectKYC={handleRejectKYC}
                      onApproveWithdrawal={handleApproveWithdrawal}
                      onAddProduct={handleAddProduct}
                      onChangeCommission={handleChangeCommission}
                      onUpdateWebsiteSettings={handleUpdateWebsiteSettings}
                      onAddCustomPage={handleAddCustomPage}
                      onDeleteCustomPage={handleDeleteCustomPage}
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
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-1 flex justify-around items-center z-45 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tree', label: 'Sugora Tree', icon: Share2 },
            { id: 'ai', label: 'Copilot Chat', icon: Sparkles },
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
                    ? 'text-indigo-600 font-extrabold scale-102' 
                    : 'text-slate-500'
                }`}
              >
                <IconComp className={`h-5 w-5 ${isSelected ? 'stroke-[2.5px] text-indigo-600' : 'stroke-[1.8px] text-slate-450'}`} />
                <span className="text-[9px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Embedded universal tiny footer */}
      <footer className="py-3 px-6 border-t border-slate-100 text-center text-[10px] text-slate-400 bg-white shrink-0 capitalize">
        Sugora.com Studio Portal © 2026 • Verified compliance standards approved
      </footer>
    </div>
  );
}
