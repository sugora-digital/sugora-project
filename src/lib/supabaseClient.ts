/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection cleanly for Vite environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyPlaceholderKey';

/**
 * Checks if the Supabase project connection has been configured by the user.
 */
export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    supabaseUrl.includes('supabase.co') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== '' &&
    supabaseAnonKey !== 'eyPlaceholderKey'
  );
}

/**
 * Production-ready Supabase Client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to upload image assets to Supabase Storage
 */
export async function uploadToStorage(bucketName: string, filePath: string, file: File) {
  try {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('[Supabase Storage Error]:', err);
    throw err;
  }
}

/**
 * Realtime helper to subscribe to channels (e.g. Chat Messages Room)
 */
export function subscribeToChatRoom(roomId: string, onMessageCallback: (payload: any) => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }
  const channel = supabase
    .channel(`chat-room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onMessageCallback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ------------------------------------------------------------------
// DATABASE PERSISTENCE HELPERS FOR FRONTEND
// ------------------------------------------------------------------

/**
 * Profiles Synchronization
 */
export async function syncProfile(profileData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        role: profileData.role,
        is_verified: profileData.is_verified,
        created_at: profileData.created_at || new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('[Supabase Sync Profile Warn] Row exists or RLS restricted:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase syncProfile Err]:', err);
    return null;
  }
}

export async function fetchProfiles() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase fetchProfiles Err]:', err);
    return [];
  }
}

/**
 * Wallets & Transactions Synchronization
 */
export async function syncWallet(walletData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('wallets')
      .upsert({
        id: walletData.id.includes('wallet') ? undefined : walletData.id, // let db assign uuid if placeholder
        user_id: walletData.user_id,
        balance: walletData.balance,
        promo_balance: walletData.promo_balance,
        withdrawn: walletData.withdrawn,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      // Retry using update if upsert has issues
      const { data: updated, error: updateErr } = await supabase
        .from('wallets')
        .update({
          balance: walletData.balance,
          promo_balance: walletData.promo_balance,
          withdrawn: walletData.withdrawn,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', walletData.user_id)
        .select()
        .single();
      
      if (updateErr) {
        console.warn('[Supabase syncWallet Warn]:', updateErr.message);
        return null;
      }
      return updated;
    }
    return data;
  } catch (err) {
    console.error('[Supabase syncWallet Err]:', err);
    return null;
  }
}

export async function insertTransaction(txData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: txData.amount,
        type: txData.type,
        status: txData.status || 'completed',
        description: txData.description,
        wallet_id: txData.wallet_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase insertTransaction Err]:', err);
    return null;
  }
}

export async function fetchTransactionsByWallet(walletId: string) {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase fetchTransactions Err]:', err);
    return [];
  }
}

/**
 * KYC Requests Integration
 */
export async function syncKYCRequest(kycData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('kyc_requests')
      .upsert({
        user_id: kycData.user_id,
        full_name: kycData.full_name,
        dob: kycData.dob,
        address: kycData.address,
        pan_card: kycData.pan_card,
        aadhaar_card: kycData.aadhaar_card,
        selfie_url: kycData.selfie_url,
        status: kycData.status,
        created_at: kycData.created_at || new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      const { data: updated, error: updateErr } = await supabase
        .from('kyc_requests')
        .update({ status: kycData.status, notes: kycData.notes })
        .eq('user_id', kycData.user_id)
        .select()
        .single();
      if (updateErr) throw updateErr;
      return updated;
    }
    return data;
  } catch (err) {
    console.error('[Supabase syncKYCRequest Err]:', err);
    return null;
  }
}

export async function fetchAllKYCRequests() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('kyc_requests').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase fetchAllKYCRequests Err]:', err);
    return [];
  }
}

/**
 * Withdrawal Requests Integration
 */
export async function syncWithdrawRequest(withdrawData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const payload = {
      id: withdrawData.id.includes('withdraw') ? undefined : withdrawData.id,
      user_id: withdrawData.user_id,
      amount: withdrawData.amount,
      method: withdrawData.method,
      details: withdrawData.details,
      status: withdrawData.status,
      created_at: withdrawData.created_at || new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('withdraw_requests')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      const { data: updated, error: updateErr } = await supabase
        .from('withdraw_requests')
        .update({ status: withdrawData.status })
        .eq('id', withdrawData.id)
        .select()
        .single();
      if (updateErr) throw updateErr;
      return updated;
    }
    return data;
  } catch (err) {
    console.error('[Supabase syncWithdrawRequest Err]:', err);
    return null;
  }
}

export async function fetchAllWithdrawRequests() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('withdraw_requests').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase fetchAllWithdrawRequests Err]:', err);
    return [];
  }
}

/**
 * Products Integration
 */
export async function fetchProducts() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase fetchProducts Err]:', err);
    return [];
  }
}

export async function insertProduct(productData: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        image_url: productData.image_url,
        price: productData.price,
        category: productData.category,
        download_file_url: productData.download_file_url,
        affiliate_link: productData.affiliate_link,
        type: productData.type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase insertProduct Err]:', err);
    return null;
  }
}

/**
 * Sugora Tree Integration
 */
export async function syncTreeProfile(treeProfile: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('tree_profiles')
      .upsert({
        id: treeProfile.id.includes('tree') ? undefined : treeProfile.id,
        user_id: treeProfile.user_id,
        username: treeProfile.username,
        display_name: treeProfile.display_name,
        bio: treeProfile.bio,
        avatar_url: treeProfile.avatar_url,
        cover_url: treeProfile.cover_url,
        social_links: treeProfile.social_links || {},
        theme: treeProfile.theme || 'modern',
        views: treeProfile.views || 0,
        created_at: treeProfile.created_at || new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase syncTreeProfile Err]:', err);
    return null;
  }
}

export async function fetchTreeProfileByUser(userId: string) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('tree_profiles')
      .select('*, tree_links(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase fetchTreeProfileByUser Err]:', err);
    return null;
  }
}

/**
 * Site Settings Integration
 */
export async function syncSiteSettings(settings: any) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        commission_rate: settings.commission_rate,
        gemini_api_configured: settings.gemini_api_configured,
        messages_limit: settings.messages_limit
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase syncSiteSettings Err]:', err);
    return null;
  }
}

export async function fetchSiteSettings() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase fetchSiteSettings Err]:', err);
    return null;
  }
}
