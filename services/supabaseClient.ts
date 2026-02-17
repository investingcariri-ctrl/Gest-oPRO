
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukoohllfepccbaltgocy.supabase.co';
const supabaseAnonKey = 'sb_publishable_Dav1sgIueYgb6RY0WlaqZQ_ukvOFghJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
