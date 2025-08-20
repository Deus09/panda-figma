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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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
    
    // Fallback: 3 saniye sonra loading'i false yap (daha agresif)
    const fallbackTimer = setTimeout(() => {
      console.log('⚠️ AuthContext: Fallback timer tetiklendi (3s), loading false yapılıyor');
      setLoading(false);
    }, 3000);
    
    return () => {
      clearTimeout(fallbackTimer);
    };

    // Supabase'in onAuthStateChange listener'ını kuruyoruz.
    // Bu, kullanıcı giriş yaptığında, çıkış yaptığında veya oturum yenilendiğinde
    // otomatik olarak tetiklenir.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthContext: onAuthStateChange tetiklendi:', event);
      console.log('📦 AuthContext: Session:', !!session);
      console.log('👤 AuthContext: Session user:', session?.user?.email || 'Yok');
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Eğer bir kullanıcı varsa, onun profil bilgilerini veritabanından çek.
      if (currentUser) {
        console.log('🔄 AuthContext: Profil yükleniyor...');
        await getProfile(currentUser);
      } else {
        console.log('❌ AuthContext: Kullanıcı yok, profil temizleniyor');
        setProfile(null); // Kullanıcı yoksa (çıkış yapmışsa) profili temizleniyor.
      }
      
      // Auth event'lerine göre loading state'i yönet
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log(`✅ AuthContext: ${event} event - Loading false yapılıyor`);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('✅ AuthContext: SIGNED_OUT event - Loading false yapılıyor');
        setLoading(false);
      } else {
        // Diğer tüm event'lerde de loading'i false yap
        console.log(`✅ AuthContext: ${event} event - Loading false yapılıyor`);
        setLoading(false);
      }
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
        console.warn('⚠️ AuthContext: Profil çekme hatası:', error);
        // Profil yoksa boş profil oluştur
        setProfile(null);
        return;
      }

      if (data) {
        console.log('✅ AuthContext: Profil bulundu:', data.username);
        setProfile(data);
      } else {
        console.log('❌ AuthContext: Profil bulunamadı, boş profil ayarlanıyor');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: getProfile exception:', error);
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

  // Email ile giriş fonksiyonu
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.error('Error signing in with email:', error);
        throw error;
      }
      // Başarılı giriş durumunda loading state'i onAuthStateChange'de false yapılacak
    } catch (error) {
      console.error('Error signing in with email:', error);
      setLoading(false);
      throw error;
    }
  };

  // Email ile kayıt fonksiyonu
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔄 AuthContext: Email kayıt işlemi başlatılıyor...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('❌ AuthContext: Email kayıt hatası:', error);
        setLoading(false);
        throw error;
      }

      console.log('✅ AuthContext: Email kayıt başarılı, kullanıcı:', data.user?.id);
      console.log('📧 AuthContext: Email confirmation required:', !data.session);
      
      // Eğer session varsa (email confirmation kapalı), doğrudan user'ı set et
      if (data.session && data.user) {
        console.log('✅ AuthContext: Session mevcut, user state güncelleniyor');
        setSession(data.session);
        setUser(data.user);
        
        // Profil yüklemeyi dene
        try {
          await getProfile(data.user);
        } catch (profileError) {
          console.warn('⚠️ AuthContext: Profil yüklenemedi:', profileError);
          setProfile(null);
        }
        
        setLoading(false);
      } else if (data.user) {
        // Email confirmation gerekli ama user oluşturuldu
        console.log('📧 AuthContext: Email confirmation gerekli, user manuel set ediliyor');
        setUser(data.user);
        setSession(null);
        setProfile(null);
        setLoading(false);
      } else {
        // Fallback timeout
        setTimeout(() => {
          console.log('⏰ AuthContext: Signup timeout ile loading false yapılıyor');
          setLoading(false);
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ AuthContext: Email kayıt genel hatası:', error);
      setLoading(false);
      throw error;
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
    signInWithEmail,
    signUpWithEmail,
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
