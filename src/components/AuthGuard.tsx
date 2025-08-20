import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { IonSpinner } from '@ionic/react';
import AuthPage from '../pages/AuthPage';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ AuthGuard: user =', !!user, 'loading =', loading);

  // Loading durumunda spinner göster
  if (loading) {
    console.log('🛡️ AuthGuard: Loading state - showing spinner');
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black to-gray-800 text-white gap-4">
        <IonSpinner name="crescent" color="primary" />
        <p className="font-sans text-base opacity-80">Yükleniyor...</p>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa auth sayfasını göster
  if (!user) {
    console.log('🛡️ AuthGuard: No user - showing auth page');
    return <AuthPage />;
  }

  // Kullanıcı giriş yapmışsa children'ı göster
  console.log('🛡️ AuthGuard: User authenticated - showing app content');
  return <>{children}</>;
};

export default AuthGuard;
