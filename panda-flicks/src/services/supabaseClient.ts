// AÇIKLAMA: Bu dosya, Supabase ile bağlantı kuran tek bir client (istemci) oluşturur ve
// projenin her yerinden bu client'a erişmemizi sağlar. Bu, kod tekrarını önler
// ve bağlantıyı tek bir yerden yönetmemize olanak tanır.

import { createClient } from '@supabase/supabase-js';

// .env dosyasından API URL ve anon key'i alıyoruz.
// import.meta.env, Vite'ın ortam değişkenlerine erişme yöntemidir.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Supabase client'ını oluşturup dışa aktarıyoruz.
// Artık projenin herhangi bir yerinde Supabase'e erişmek istediğimizde,
// bu 'supabase' nesnesini import etmemiz yeterli olacak.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);