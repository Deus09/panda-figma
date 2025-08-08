// AÇIKLAMA: Bu dosya, Supabase ile bağlantı kuran tek bir client (istemci) oluşturur ve
// projenin her yerinden bu client'a erişmemizi sağlar. Bu, kod tekrarını önler
// ve bağlantıyı tek bir yerden yönetmemize olanak tanır.

import { createClient } from '@supabase/supabase-js';

// .env dosyasından API URL ve anon key'i alıyoruz.
// import.meta.env, Vite'ın ortam değişkenlerine erişme yöntemidir.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client'ını oluşturup dışa aktarıyoruz.
// Artık projenin herhangi bir yerinde Supabase'e erişmek istediğimizde,
// bu 'supabase' nesnesini import etmemiz yeterli olacak.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogle = async () => {
  // Dinamik origin kullan (port otomatik tespit)
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  console.log('🔗 OAuth redirect URL (supabaseClient):', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  if (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
  
  return data;
};

// Kullanıcı durumunu kontrol etmek için yardımcı fonksiyon
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Kullanıcı session'ını kontrol et
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Çıkış yapma fonksiyonu
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};