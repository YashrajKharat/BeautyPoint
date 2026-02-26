import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ ACCESSIBILITY: Point to the Proxy
// On Vercel, we use the local root domain. Vercel rewrites handle /auth, /rest, and /storage.
// This ensures the browser stays on one domain to bypass ISP blocks on supabase.co.
const isVercel = window.location.hostname.includes('vercel.app');
const finalSupabaseUrl = isVercel
    ? window.location.origin
    : (supabaseUrl || 'https://beautypoint.onrender.com');

if (!finalSupabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing from environment variables');
}

export const supabase = createClient(finalSupabaseUrl, supabaseKey);
