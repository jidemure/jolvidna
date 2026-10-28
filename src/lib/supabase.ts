import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawUrl && process.env.NODE_ENV !== 'test') {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables. Falling back to build placeholder.');
}

const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseServiceRoleKey = rawKey || 'dummy-service-role-key-for-build';

/**
 * Server-side Supabase client with admin/service-role access.
 * NEVER import or execute this in client-side components ('use client').
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
