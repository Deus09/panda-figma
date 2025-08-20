import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { IonSpinner } from '@ionic/react';
import AuthPage from '../pages/AuthPage';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black to-gray-800 text-white gap-4">
        <IonSpinner name="crescent" color="primary" />
        <p className="font-sans text-base opacity-80">Yükleniyor...</p>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa auth sayfasını göster
  if (!user) {
    return <AuthPage />;
  }

  // Kullanıcı giriş yapmışsa children'ı göster
  return <>{children}</>;
};

export default AuthGuard;
