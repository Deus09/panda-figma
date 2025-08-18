import React from 'react';
import { IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export interface PaywallModalProps {
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
          description: t('paywall.watchlist_limit.description', 'Ücretsiz kullanıcılar 100 filme kadar izleme listesi oluşturabilir.'),
          icon: '📝'
        };
      case 'ai-recommendations':
        return {
          title: t('paywall.ai_recommendations.title', 'AI Film Önerileri'),
          description: t('paywall.ai_recommendations.description', 'Kişiselleştirilmiş AI önerilerinize erişim için Pro üyelik gereklidir.'),
          icon: '🤖'
        };
      case 'comment-enhancer':
        return {
          title: t('paywall.comment_enhancer.title', 'Yorum Geliştirici'),
          description: t('paywall.comment_enhancer.description', 'AI ile yorumlarınızı geliştirin ve daha etkileyici hale getirin.'),
          icon: '✨'
        };
      case 'chat-with-cast':
        return {
          title: t('paywall.chat_with_cast.title', 'Oyuncularla Sohbet'),
          description: t('paywall.chat_with_cast.description', 'AI ile favori oyuncularınızla sohbet etme deneyimi yaşayın.'),
          icon: '💬'
        };
      case 'detailed-stats':
        return {
          title: t('paywall.detailed_stats.title', 'Detaylı İstatistikler'),
          description: t('paywall.detailed_stats.description', 'İzleme geçmişinizin derinlemesine analizi için Pro üyelik gereklidir.'),
          icon: '📊'
        };
      default:
        return {
          title: t('paywall.default.title', 'Premium Özellik'),
          description: t('paywall.default.description', 'Bu özellik Pro üyeler için ayrılmıştır.'),
          icon: '⭐'
        };
    }
  };

  const featureInfo = getFeatureInfo();

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    onSubscribe?.(plan);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="paywall-modal">
      <div className="relative min-h-full bg-gradient-to-br from-[#0F0F23] via-[#1A1A2E] to-[#16213E] overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-8">
            <div className="text-2xl font-bold text-white">
              {featureInfo.icon} {featureInfo.title}
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl p-2 rounded-full hover:bg-white/10 transition-all"
            >
              ×
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-6 pb-8">
            {/* Feature Description */}
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">{featureInfo.icon}</div>
              <p className="text-white/80 text-lg leading-relaxed">
                {featureInfo.description}
              </p>
            </div>

            {/* Premium Features List */}
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-4">Pro üyelikle kazanın:</h3>
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3">✓</span>
                  Sınırsız İzleme Listesi
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3">✓</span>
                  AI Film Önerileri
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3">✓</span>
                  Yorum Geliştirici AI
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3">✓</span>
                  Oyuncularla AI Sohbet
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3">✓</span>
                  Detaylı İstatistikler
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="space-y-4">
              {/* Yearly Plan - Popular */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    EN POPÜLER
                  </span>
                </div>
                <button
                  onClick={() => handleSubscribe('yearly')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-6 rounded-2xl transition-all transform hover:scale-105 border-2 border-purple-400/50"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <div className="text-xl font-bold">Yıllık Plan</div>
                      <div className="text-white/80">İlk 1 ay ücretsiz</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₺99</div>
                      <div className="text-white/80 line-through">₺119</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Monthly Plan */}
              <button
                onClick={() => handleSubscribe('monthly')}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-6 rounded-2xl transition-all border border-white/20"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-xl font-bold">Aylık Plan</div>
                    <div className="text-white/80">İstediğin zaman iptal et</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₺12</div>
                    <div className="text-white/80">/ay</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-white/60 text-sm">
                İstediğin zaman iptal edebilirsin. Gizlilik politikamız ve kullanım şartlarımız geçerlidir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default PaywallModal;
