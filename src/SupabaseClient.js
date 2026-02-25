import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ ACCESSIBILITY: Point to the Proxy
// If we are on Vercel, use the local /supabase-proxy path to ensure PKCE stability
// This keeps the browser on the same domain and fixes the "Unable to store session" issue
const isVercel = window.location.hostname.includes('vercel.app');
const finalSupabaseUrl = isVercel
    ? window.location.origin + '/supabase-proxy'
    : (supabaseUrl || 'https://beautypoint.onrender.com');

if (!finalSupabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing from environment variables');
}

export const supabase = createClient(finalSupabaseUrl, supabaseKey);
