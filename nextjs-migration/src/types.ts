/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'support' | 'admin';

export interface Profile {
  id: string;
  email: string;
  name: string;
  username: string; // unique, used for path: sugora.com/u/username
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  is_verified: boolean;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  promo_balance: number;
  withdrawn: number;
  updated_at: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'affiliate_earning' | 'referral_earning' | 'product_sale' | 'admin_reward';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  created_at: string;
}

export interface WithdrawRequest {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer';
  details: string; // e.g. UPI ID or Account No & IFSC
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface KYCRequest {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  dob: string;
  address: string;
  pan_card: string;
  aadhaar_card: string;
  selfie_url: string;
  status: KYCStatus;
  created_at: string;
  reviewed_at?: string;
  notes?: string;
}

export interface AffiliateAccount {
  user_id: string;
  referral_code: string;
  referral_link: string;
  total_clicks: number;
  total_registrations: number;
  total_sales: number;
  earnings: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  download_file_url?: string;
  affiliate_link?: string;
  type: 'digital_download' | 'affiliate_product';
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_id?: string;
  created_at: string;
}

export interface TreeLink {
  id: string;
  title: string;
  url: string;
  type: 'instagram' | 'youtube' | 'facebook' | 'telegram' | 'whatsapp' | 'website' | 'custom';
  clicks: number;
}

export interface TreeProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  cover_url?: string;
  social_links: Record<string, string>; // e.g., facebook, instagram, youtube, telegram
  links: TreeLink[];
  theme: string; // e.g. 'modern', 'dark_neon', 'pastel', 'cyberpunk'
  views: number;
  created_at: string;
}

export interface SugoraApp {
  id: string;
  name: string;
  description: string;
  logo: string; // Material icon name or emoji
  url: string; // Embedded iframe url or fallback simulation
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'one-to-one' | 'support';
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  participant_id: string; // ID of the other user
  participant_name: string;
  participant_username: string;
  participant_avatar?: string;
  is_online?: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  file_url?: string;
  file_type?: 'image' | 'file';
  created_at: string;
  is_read: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  username: string;
  title: string;
  description: string;
  category: 'Wallet/Payments' | 'KYC' | 'Affiliate' | 'Shop' | 'Sugora Tree' | 'Other';
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  assigned_to?: string; // support agent name
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export interface SiteSettings {
  commission_rate: number; // base referral/affiliate commission percentage, e.g. 10 (%)
  gemini_api_configured: boolean;
  messages_limit: number; // default limit e.g. 50
}
