import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ ACCESSIBILITY: Point to the Render Proxy if we are in production
// This allows bypassing Indian ISP blocks on .supabase.co
const finalSupabaseUrl = supabaseUrl;

if (!finalSupabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing from environment variables');
}

export const supabase = createClient(finalSupabaseUrl, supabaseKey);
