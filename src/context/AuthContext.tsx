// AÇIKLAMA: Bu dosya, uygulamanın tamamında kullanıcı oturumunu (session) ve profil
// bilgilerini yönetecek olan merkezi state yönetim sistemini (React Context) oluşturur.
// Bu sayede her sayfadan "kullanıcı giriş yapmış mı?" diye kontrol edebiliriz.

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Context'in içinde hangi verilerin ve fonksiyonların bulunacağını tanımlıyoruz.
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null; // Profil verisi için şimdilik 'any' kullanıyoruz.
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// React Context'i oluşturuyoruz.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider bileşenini oluşturuyoruz. Bu bileşen, tüm uygulamayı sarmalayarak
// içindeki tüm bileşenlerin AuthContext verilerine erişmesini sağlayacak.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Debug için loading state'ini izle
  useEffect(() => {
    console.log('🔄 AuthContext: Loading state değişti:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🚀 AuthContext: useEffect başladı');
    
    // İlk yükleme sırasında mevcut session'ı kontrol et
    const getInitialSession = async () => {
      console.log('🔄 AuthContext: getInitialSession fonksiyonu çağrıldı');
      
      try {
        console.log('🔄 AuthContext: İlk session kontrolü başlıyor...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('📦 AuthContext: İlk session alındı:', !!initialSession);
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        console.log('👤 AuthContext: Kullanıcı:', currentUser?.email || 'Yok');
        setUser(currentUser);
        
        if (currentUser) {
          console.log('🔄 AuthContext: Profil yükleniyor...');
          await getProfile(currentUser);
        } else {
          console.log('❌ AuthContext: Kullanıcı yok, profil temizleniyor');
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: İlk session kontrolü hatası:', error);
      } finally {
        console.log('✅ AuthContext: Loading false yapılıyor');
        setLoading(false);
      }
    };

    // Hemen çalıştır
    getInitialSession();
    
    // Fallback: 5 saniye sonra loading'i false yap
    const fallbackTimer = setTimeout(() => {
      console.log('⚠️ AuthContext: Fallback timer tetiklendi, loading false yapılıyor');
      setLoading(false);
    }, 5000);
    
    return () => {
      clearTimeout(fallbackTimer);
    };

    // Supabase'in onAuthStateChange listener'ını kuruyoruz.
    // Bu, kullanıcı giriş yaptığında, çıkış yaptığında veya oturum yenilendiğinde
    // otomatik olarak tetiklenir.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthContext: onAuthStateChange tetiklendi:', event);
      console.log('📦 AuthContext: Session:', !!session);
      setSession(session);
      const currentUser = session?.user ?? null;
      console.log('👤 AuthContext: Kullanıcı:', currentUser?.email || 'Yok');
      setUser(currentUser);
      
      // Eğer bir kullanıcı varsa, onun profil bilgilerini veritabanından çek.
      if (currentUser) {
        console.log('🔄 AuthContext: Profil yükleniyor...');
        await getProfile(currentUser);
      } else {
        console.log('❌ AuthContext: Kullanıcı yok, profil temizleniyor');
        setProfile(null); // Kullanıcı yoksa (çıkış yapmışsa) profili temizleniyor.
      }
      console.log('✅ AuthContext: Loading false yapılıyor');
      setLoading(false);
    });

    // Component DOM'dan kaldırıldığında (unmount) listener'ı temizliyoruz.
    // Bu, hafıza sızıntılarını önler.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Kullanıcının profil bilgilerini 'profiles' tablosundan çeken fonksiyon.
  const getProfile = async (user: User) => {
    try {
      console.log('🔄 AuthContext: getProfile çağrıldı, user ID:', user.id);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single();

      console.log('📦 AuthContext: getProfile response:', { data, error, status });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log('✅ AuthContext: Profil bulundu:', data.username);
        setProfile(data);
      } else {
        console.log('❌ AuthContext: Profil bulunamadı');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: getProfile hatası:', error);
      setProfile(null);
    }
  };

  // Google ile giriş fonksiyonu
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
  // Dinamik origin (Codespaces / farklı port senaryoları için)
  const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('🔗 OAuth redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) {
        console.error('Error signing in with Google:', error);
        setLoading(false);
      }
      // Başarılı giriş durumunda loading state'i onAuthStateChange'de false yapılacak
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setLoading(false);
      }
      // Başarılı çıkış durumunda loading state'i onAuthStateChange'de false yapılacak
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  // Context aracılığıyla paylaşılacak olan değerler.
  const value = {
    session,
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Context'i her seferinde uzun uzun yazmak yerine kolayca kullanmak için
// bir custom hook oluşturuyoruz.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
