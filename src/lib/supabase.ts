import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Para o Painel Admin/Dashboard
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'nexlyra-admin-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Para a Loja (Clientes)
export const customerSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'nexlyra-customer-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

