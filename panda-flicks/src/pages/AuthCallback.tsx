import React, { useEffect } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AuthCallback: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL fragment'indeki hash token'ları işle
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Token'ları Supabase session'ına set et
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Auth session error:', error);
            history.replace('/home');
            return;
          }

          if (data.session) {
            console.log('Kullanıcı başarıyla giriş yaptı:', data.session.user);
            
            // URL'i temizle (token'ları kaldır)
            window.history.replaceState({}, document.title, '/home');
            
            // Ana sayfaya yönlendir
            history.replace('/home');
          } else {
            console.error('Session oluşturulamadı');
            history.replace('/home');
          }
        } else {
          // Token yoksa normal session kontrolü yap
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            console.log('Mevcut session bulundu:', data.session.user);
            history.replace('/home');
          } else {
            console.log('Token bulunamadı, ana sayfaya yönlendiriliyor');
            history.replace('/home');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        history.replace('/home');
      }
    };

    handleAuthCallback();
  }, [history]);

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center">
        <div className="flex flex-col items-center justify-center h-full">
          <IonSpinner name="dots" color="primary" />
          <p className="mt-4 text-foreground">Giriş yapılıyor...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;
