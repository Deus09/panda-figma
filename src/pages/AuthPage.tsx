import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonHeader,
  IonToolbar,
  IonText,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { logoGoogle, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Şifre kuralları doğrulama
  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    
    if (!minLength) {
      return t('auth.password_min_length', 'Şifre en az 8 karakter olmalıdır');
    }
    if (!hasUpperCase) {
      return t('auth.password_uppercase', 'Şifre en az 1 büyük harf içermelidir');
    }
    if (!hasLowerCase) {
      return t('auth.password_lowercase', 'Şifre en az 1 küçük harf içermelidir');
    }
    if (!hasSpecialChar) {
      return t('auth.password_special', 'Şifre en az 1 özel karakter içermelidir');
    }
    return '';
  };

  // Şifre değiştiğinde doğrulama
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!isLogin && value) {
      const error = validatePassword(value);
      setPasswordError(error);
    } else {
      setPasswordError('');
    }
    
    // Şifre onayı kontrolü
    if (!isLogin && confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError(t('auth.passwords_do_not_match', 'Şifreler eşleşmiyor'));
    } else {
      setConfirmPasswordError('');
    }
  };

  // Şifre onayı değiştiğinde doğrulama
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (!isLogin && password && value !== password) {
      setConfirmPasswordError(t('auth.passwords_do_not_match', 'Şifreler eşleşmiyor'));
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    
    // Kayıt olurken şifre doğrulamaları
    if (!isLogin) {
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }
      
      if (password !== confirmPassword) {
        setConfirmPasswordError(t('auth.passwords_do_not_match', 'Şifreler eşleşmiyor'));
        return;
      }
    }

    setEmailLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      alert(error.message || t('auth.error_occurred', 'Bir hata oluştu'));
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <IonPage className="auth-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="auth-content">
        <div className="auth-container">
          {/* Logo Section */}
          <div className="auth-logo-section">
            <div className="auth-logo">
              <img src={logoImage} alt="Moviloi Logo" className="auth-logo-image" />
            </div>
            <IonText color="medium" className="auth-subtitle">
              {t('auth.app_subtitle')}
            </IonText>
          </div>

          {/* Auth Form */}
          <IonCard className="auth-card">
            <IonCardHeader>
              <IonCardTitle className="auth-card-title">
                {isLogin ? t('auth.sign_in') : t('auth.create_account')}
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {/* Email Input */}
              <IonItem className="auth-input-item">
                <IonIcon icon={mailOutline} slot="start" color="medium" />
                <IonInput
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  className="auth-input"
                />
              </IonItem>

              {/* Password Input */}
              <IonItem className="auth-input-item">
                <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                <IonInput
                  type="password"
                  placeholder={t('auth.password_placeholder')}
                  value={password}
                  onIonInput={(e) => handlePasswordChange(e.detail.value!)}
                  className="auth-input"
                />
              </IonItem>
              {/* Password Error Message */}
              {passwordError && (
                <IonText color="danger" className="text-sm ml-4 mb-2 block">
                  {passwordError}
                </IonText>
              )}

              {/* Confirm Password (only for signup) */}
              {!isLogin && (
                <>
                  <IonItem className="auth-input-item">
                    <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                    <IonInput
                      type="password"
                      placeholder={t('auth.confirm_password_placeholder')}
                      value={confirmPassword}
                      onIonInput={(e) => handleConfirmPasswordChange(e.detail.value!)}
                      className="auth-input"
                    />
                  </IonItem>
                  {/* Confirm Password Error Message */}
                  {confirmPasswordError && (
                    <IonText color="danger" className="text-sm ml-4 mb-2 block">
                      {confirmPasswordError}
                    </IonText>
                  )}
                </>
              )}

              {/* Email Auth Button */}
              <IonButton
                expand="block"
                className="auth-email-button"
                onClick={handleEmailAuth}
                disabled={emailLoading || !email || !password}
              >
                {emailLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  isLogin ? t('auth.sign_in') : t('auth.create_account')
                )}
              </IonButton>

              {/* Divider */}
              <div className="auth-divider">
                <span>{t('auth.or')}</span>
              </div>

              {/* Google Sign In Button */}
              <IonButton
                expand="block"
                fill="outline"
                className="google-signin-button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={logoGoogle} slot="start" />
                    {isLogin ? t('auth.google_sign_in') : t('auth.google_sign_up')}
                  </>
                )}
              </IonButton>

              {/* Toggle Login/Signup */}
              <div className="auth-toggle">
                <IonText color="medium">
                  {isLogin ? t('auth.no_account') : t('auth.have_account')}
                </IonText>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => setIsLogin(!isLogin)}
                  className="auth-toggle-button"
                >
                  {isLogin ? t('auth.sign_up') : t('auth.sign_in')}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
