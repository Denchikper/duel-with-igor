import { createClient } from '@supabase/supabase-js';

// Публичные значения (anon/publishable-ключ по дизайну уезжает в клиент, данные
// защищает RLS). Хардкодим как дефолт, чтобы сборка работала без env — и через
// Git-интеграцию Cloudflare, и через wrangler. env, если задан, перекрывает.
const SUPABASE_URL = 'https://bucflbemhrxcfucrptdk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bFYe0MhrjFPSfHKSZS4NDA_n6aOv6fh';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
);
