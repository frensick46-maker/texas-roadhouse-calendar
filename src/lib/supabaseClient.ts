import { createClient } from '@supabase/supabase-js'

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback to dummy values so the app can still render
// even before Supabase is configured. Auth calls will then
// just fail with an error message instead of crashing the app.
const supabaseUrl = envSupabaseUrl || 'https://example.supabase.co'
const supabaseAnonKey = envSupabaseAnonKey || 'public-anon-key'

if (!envSupabaseUrl || !envSupabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are not set. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real authentication.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

