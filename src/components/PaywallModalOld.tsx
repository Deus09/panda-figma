import React from 'react';
import { IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'watchlist-limit' | 'ai-recommendations' | 'comment-enhancer' | 'chat-with-cast' | 'detailed-stats';
  onSubscribe?: (plan: 'monthly' | 'yearly') => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature,
  onSubscribe
}) => {
  const { t } = useTranslation();

  // Feature'a göre başlık ve açıklama
  const getFeatureInfo = () => {
    switch (feature) {
      case 'watchlist-limit':
        return {
          title: t('paywall.watchlist_limit.title', 'İzleme Listesi Limiti'),
          subtitle: t('paywall.watchlist_limit.subtitle', 'Ücretsiz hesabınızda 100 film/dizi limitine ulaştınız'),
          icon: '🎬',
          benefits: [
            t('paywall.watchlist_limit.benefit1', 'Sınırsız izleme listesi'),
            t('paywall.watchlist_limit.benefit2', 'Gelişmiş filtreleme'),
            t('paywall.watchlist_limit.benefit3', 'Öncelik sıralama')
          ]
        };
      case 'ai-recommendations':
        return {
          title: t('paywall.ai_recommendations.title', 'AI Film Önerileri'),
          subtitle: t('paywall.ai_recommendations.subtitle', 'Kişiselleştirilmiş film önerileri için Pro gerekli'),
          icon: '🤖',
          benefits: [
            t('paywall.ai_recommendations.benefit1', 'Kişiselleştirilmiş öneriler'),
            t('paywall.ai_recommendations.benefit2', 'Gelişmiş AI algoritması'),
            t('paywall.ai_recommendations.benefit3', 'Anlık öneriler')
          ]
        };
      case 'comment-enhancer':
        return {
          title: t('paywall.comment_enhancer.title', 'Yorum Geliştirici'),
          subtitle: t('paywall.comment_enhancer.subtitle', 'AI ile yorumlarınızı geliştirin'),
          icon: '✨',
          benefits: [
            t('paywall.comment_enhancer.benefit1', 'AI destekli yorum geliştirme'),
            t('paywall.comment_enhancer.benefit2', 'Dil bilgisi düzeltme'),
            t('paywall.comment_enhancer.benefit3', 'Yaratıcı öneriler')
          ]
        };
      case 'chat-with-cast':
        return {
          title: t('paywall.chat_with_cast.title', 'Oyuncularla Sohbet'),
          subtitle: t('paywall.chat_with_cast.subtitle', 'Favori karakterlerinizle AI sohbeti'),
          icon: '💬',
          benefits: [
            t('paywall.chat_with_cast.benefit1', 'Gerçekçi karakter sohbetleri'),
            t('paywall.chat_with_cast.benefit2', 'Film/dizi analizleri'),
            t('paywall.chat_with_cast.benefit3', 'Sınırsız sohbet')
          ]
        };
      case 'detailed-stats':
        return {
          title: t('paywall.detailed_stats.title', 'Detaylı İstatistikler'),
          subtitle: t('paywall.detailed_stats.subtitle', 'İzleme alışkanlıklarınızın detayları'),
          icon: '📊',
          benefits: [
            t('paywall.detailed_stats.benefit1', 'Gelişmiş analitik'),
            t('paywall.detailed_stats.benefit2', 'Zaman grafikları'),
            t('paywall.detailed_stats.benefit3', 'Kişisel raporlar')
          ]
        };
      default:
        return {
          title: 'Moviloi Pro',
          subtitle: 'Premium özellikler için yükseltme yapın',
          icon: '⭐',
          benefits: ['Premium özellikler', 'Sınırsız erişim', 'Öncelikli destek']
        };
    }
  };

  const featureInfo = getFeatureInfo();

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    if (onSubscribe) {
      onSubscribe(plan);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="premium-paywall-modal">
      {/* Premium Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A2E] to-[#16213E] relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-[#FE7743]/20 to-[#FF6B35]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-20 w-60 h-60 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main Content */}
        <div className="relative z-10 px-6 py-8 min-h-screen flex flex-col">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Feature Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FE7743] via-[#FF6B35] to-[#FF8C42] rounded-2xl flex items-center justify-center text-4xl shadow-2xl border border-white/20">
              {featureInfo.icon}
            </div>
            
            {/* PRO Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-4 bg-gradient-to-r from-[#FE7743] to-[#FF6B35] rounded-full">
              <span className="text-white font-bold text-sm tracking-wide">⭐ MOVILOI PRO</span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-3 font-poppins">
              {featureInfo.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto">
              {featureInfo.subtitle}
            </p>
          </div>

          {/* Features Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Pro ile neler kazanırsın?
            </h3>
            <div className="space-y-4">
              {featureInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-4 mb-8">
            {/* Yearly Plan - Most Popular */}
            <div className="relative p-6 bg-gradient-to-r from-[#FE7743]/20 to-[#FF6B35]/20 rounded-2xl border-2 border-[#FE7743] backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#FE7743] to-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-bold">
                  EN POPÜLER
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">12 Aylık Plan</h4>
                  <p className="text-gray-300 text-sm">En iyi değer!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">₺1.67/ay</div>
                  <div className="text-gray-400 line-through text-sm">₺2.00</div>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('yearly')}
                className="w-full py-4 bg-gradient-to-r from-[#FE7743] to-[#FF6B35] text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                Yıllık Planı Seç - ₺20
              </button>
              
              <p className="text-center text-gray-400 text-xs mt-2">%17 tasarruf et</p>
            </div>

            {/* Monthly Plan */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">Aylık Plan</h4>
                  <p className="text-gray-300 text-sm">Esnek ödeme</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">₺2.00/ay</div>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('monthly')}
                className="w-full py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Aylık Planı Seç - ₺2
              </button>
            </div>
          </div>

          {/* Free Trial Notice */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30">
              <span className="text-blue-300 font-medium">🎁 İlk 1 ay ücretsiz!</span>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Otomatik yenileme • İstediğin zaman iptal et
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <a href="#" className="text-gray-500 hover:text-gray-300">Kullanım Koşulları</a>
              <a href="#" className="text-gray-500 hover:text-gray-300">Gizlilik Politikası</a>
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default PaywallModal;
