import React, { useEffect } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';

const AuthCallback: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = React.useState(false);

  useEffect(() => {
    if (isProcessing) return;
    setIsProcessing(true);

    const handleAuthCallback = async () => {
      console.log('🔄 AuthCallback başladı');
      console.log('📍 Mevcut URL:', window.location.href);
      console.log('🔗 Hash:', window.location.hash);
      console.log('📂 Pathname:', window.location.pathname);
      console.log('🔍 Search params:', window.location.search);
      console.log('🌐 Origin:', window.location.origin);
      console.log('🏠 Host:', window.location.host);

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
            
            // Profile sayfasına yönlendir (giriş başarılı olduğunda)
            console.log('🏠 Profile sayfasına yönlendiriliyor...');
            
            // Hem history.replace hem de window.location.href kullan (çifte güvenlik)
            setTimeout(() => {
              console.log('🔄 Yönlendirme işlemi başlıyor...');
              
              // Önce history ile dene
              try {
                history.replace('/profile');
                console.log('✅ History.replace ile yönlendirme başarılı');
              } catch (historyError) {
                console.error('❌ History.replace hatası:', historyError);
                // Hata varsa window.location.href kullan
                window.location.href = '/profile';
                console.log('✅ Window.location.href ile yönlendirme yapıldı');
              }
            }, 1000);  // 1 saniye bekle (session'ın tamamen kurulması için)
            
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
  }, [history, isProcessing]);

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <IonSpinner name="dots" color="primary" className="w-12 h-12" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Google ile giriş yapılıyor...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Token işleniyor, lütfen bekleyin...
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Sorun yaşıyorsanız Console (F12) loglarını kontrol edin
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;
