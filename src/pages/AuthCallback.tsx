import React, { useEffect } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';

const AuthCallback: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // İlk olarak alert ile test edelim
      alert('AuthCallback component çalışıyor! URL: ' + window.location.href);
      
      console.log('🔄 AuthCallback başladı');
      console.log('📍 Mevcut URL:', window.location.href);
      console.log('🔗 Hash:', window.location.hash);
      
      // Debug için console.warn da deneyelim
      console.warn('⚠️ DEBUG: AuthCallback çalışıyor');
      console.error('🔴 DEBUG: Bu da error log testi');
      
      try {
        // URL fragment'indeki hash token'ları işle
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresAt = hashParams.get('expires_at');
        const tokenType = hashParams.get('token_type');

        console.log('🔑 Token bilgileri:', {
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
          refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : null,
          expiresAt,
          tokenType
        });

        if (accessToken) {
          alert('Access token bulundu: ' + accessToken.substring(0, 20) + '...');
          console.log('✅ Access token bulundu, session kuruluyor...');
          
          // Token'ları Supabase session'ına set et
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          console.log('📦 setSession response:', { data: !!data.session, error });

          if (error) {
            console.error('❌ Auth session error:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            history.replace('/home');
            return;
          }

          if (data.session) {
            console.log('🎉 Kullanıcı başarıyla giriş yaptı!');
            console.log('👤 User info:', {
              id: data.session.user.id,
              email: data.session.user.email,
              name: data.session.user.user_metadata?.full_name
            });
            
            // URL'i temizle (token'ları kaldır)
            console.log('🧹 URL temizleniyor...');
            window.history.replaceState({}, document.title, '/home');
            
            // Kısa bir delay ekleyelim
            setTimeout(() => {
              console.log('🏠 Ana sayfaya yönlendiriliyor...');
              history.replace('/home');
            }, 1000);
          } else {
            console.error('❌ Session oluşturulamadı, data var ama session yok');
            history.replace('/home');
          }
        } else {
          console.log('❓ Access token bulunamadı, mevcut session kontrol ediliyor...');
          
          // Token yoksa normal session kontrolü yap
          const { data } = await supabase.auth.getSession();
          
          console.log('🔍 Mevcut session kontrolü:', !!data.session);
          
          if (data.session) {
            console.log('✅ Mevcut session bulundu:', data.session.user.email);
            history.replace('/home');
          } else {
            console.log('❌ Token bulunamadı, ana sayfaya yönlendiriliyor');
            history.replace('/home');
          }
        }
      } catch (error) {
        console.error('💥 Auth callback error:', error);
        console.error('💥 Error stack:', error.stack);
        history.replace('/home');
      }
    };

    handleAuthCallback();
  }, [history]);

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <IonSpinner name="dots" color="primary" className="w-12 h-12" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{t('auth.signing_in_with_google')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              AuthCallback Component Çalışıyor ✅
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              URL: {window.location.href}
            </p>
            <p className="text-xs text-muted-foreground">
              Hash: {window.location.hash || 'Hash yok'}
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;
