/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, SugoraApp, Profile, Wallet, SupportTicket, WalletTransaction } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Instagram Growth Blueprint v2',
    description: 'The ultimate digital handbook featuring proven frameworks to acquire your first 10,000 algorithmic followers organically with clean content.',
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=200',
    price: 499.00,
    category: 'E-Books',
    download_file_url: 'https://sugora.com/downloads/instagram-growth-blueprint.pdf',
    type: 'digital_download',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: 'prod-2',
    name: 'SaaS Dashboard Figma Assets',
    description: 'Complete UI kit including highly organized grids, dark mode palettes, interactive button variables, and comprehensive analytics charts.',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    price: 999.00,
    category: 'Design Templates',
    download_file_url: 'https://sugora.com/downloads/saas-dashboard-kit.fig',
    type: 'digital_download',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Premium WordPress Hosting',
    description: 'Get world-class 0.1s page speeds with built-in Cloudflare Enterprise CDN and managed backups. Purchase through this affiliate card to earn cashback!',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=200',
    price: 1499.00,
    category: 'Affiliate Services',
    affiliate_link: 'https://hosting.example.com/sugora-partner-special',
    type: 'affiliate_product',
    created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString()
  }
];

export const INITIAL_APPS: SugoraApp[] = [
  {
    id: 'app-instagram',
    name: 'Instagram',
    description: 'Browse feeds, explore reels, and monitor modern visual inspirations.',
    logo: 'Instagram',
    url: 'https://www.instagram.com/p/CgK7Hh-uFzq/embed'
  },
  {
    id: 'app-youtube',
    name: 'YouTube',
    description: 'Watch cinematic educational guides and tutorial video resources.',
    logo: 'Youtube',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'app-facebook',
    name: 'Facebook',
    description: 'Check interactive local community grids and public status threads.',
    logo: 'Facebook',
    url: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F20531316728%2Fposts%2F10154009990506729%2F&width=500'
  },
  {
    id: 'app-telegram',
    name: 'Telegram Web',
    description: 'Connect with visual workspace channels and modular news bulletin lists.',
    logo: 'Send',
    url: 'https://web.telegram.org/z/'
  },
  {
    id: 'app-x',
    name: 'X (Twitter)',
    description: 'Monitor instantaneous global micro-trends and developer feeds.',
    logo: 'Twitter',
    url: 'https://platform.twitter.com/widgets/tweet_button.html?text=Sugora%20is%20amazing!'
  }
];

export const INITIAL_MOCK_USERS: Profile[] = [
  {
    id: 'user-ceo',
    email: 'ceo.sugora@gmail.com',
    name: 'CEO Sugora',
    username: 'ceo',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    is_verified: true
  },
  {
    id: 'user-johndoe',
    email: 'johndoe@gmail.com',
    name: 'John Doe',
    username: 'johndoe',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'user',
    created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    is_verified: false
  },
  {
    id: 'support-agent',
    email: 'support.sugora@gmail.com',
    name: 'Agent Sarah',
    username: 'sarah_support',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    role: 'support',
    created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    is_verified: true
  }
];

export const INITIAL_MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tick-1',
    user_id: 'user-johndoe',
    username: 'johndoe',
    title: 'Razorpay payment processed but download link greyed out',
    description: 'I paid Rs. 499 for the Instagram Growth Blueprint. The order shows pending but money debited from UPI. Please help me approve the file.',
    category: 'Wallet/Payments',
    status: 'open',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'tick-2',
    user_id: 'user-johndoe',
    username: 'johndoe',
    title: 'KYC Document Verification Status',
    description: 'Uploaded my scanned Aadhaar Card and PAN Card. Please verify so I can initiate withdrawals to my Google Pay UPI.',
    category: 'KYC',
    status: 'assigned',
    assigned_to: 'Agent Sarah',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString()
  }
];

export const INITIAL_TRANSACTIONS = (walletId: string): WalletTransaction[] => [
  {
    id: 'tx-1',
    wallet_id: walletId,
    amount: 100.00,
    type: 'admin_reward',
    status: 'completed',
    description: 'Sugora platform welcome promotional credit',
    created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString()
  },
  {
    id: 'tx-2',
    wallet_id: walletId,
    amount: 50.00,
    type: 'deposit',
    status: 'completed',
    description: 'Manual funds deposit via integrated UPI Gateway',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
  }
];
