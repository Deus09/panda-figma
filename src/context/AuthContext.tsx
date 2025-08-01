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

  useEffect(() => {
    // Supabase'in onAuthStateChange listener'ını kuruyoruz.
    // Bu, kullanıcı giriş yaptığında, çıkış yaptığında veya oturum yenilendiğinde
    // otomatik olarak tetiklenir.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Eğer bir kullanıcı varsa, onun profil bilgilerini veritabanından çek.
      if (currentUser) {
        await getProfile(currentUser);
      } else {
        setProfile(null); // Kullanıcı yoksa (çıkış yapmışsa) profili temizle.
      }
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
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Google ile giriş fonksiyonu
  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
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
