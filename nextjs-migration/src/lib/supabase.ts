/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Setup environment variables for Next.js 15 (using NEXT_PUBLIC_ for client parts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyPlaceholderKey';

/**
 * Isomorphic Supabase Client
 * Resolves configuration instantly on both the server (Next.js Edge/Serverless)
 * and client contexts in single browser frames.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service Role Client
 * ONLY invoke this on the server-side (Next.js API route handlers, Server Actions)
 * as it bypasses Row Level Security (RLS) protections for administrative work.
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required to create an Admin client.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
