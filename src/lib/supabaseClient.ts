/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection cleanly for Vite environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyPlaceholderKey';

/**
 * Production-ready Supabase Client
 * To connect your live database:
 * 1. Build a Supabase project at https://supabase.com
 * 2. Paste the SQL statements from 'supabase_schema.sql' into the Supabase SQL editor to create your tables.
 * 3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local environment or host dashboard.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to upload image assets to Supabase Storage
 * @param bucketName Name of the storage bucket
 * @param filePath Path where the file should be saved in the bucket
 * @param file The file object itself
 */
export async function uploadToStorage(bucketName: string, filePath: string, file: File) {
  try {
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
 * @param roomId Room to track
 * @param onMessageCallback Dynamic callback on new message event
 */
export function subscribeToChatRoom(roomId: string, onMessageCallback: (payload: any) => void) {
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
