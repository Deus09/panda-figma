import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

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

  const handleSubscribe = () => {
    onSubscribe?.(selectedPlan);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="paywall-modal">
      <div className="relative h-full bg-gradient-to-br from-[#0F0F23] via-[#1A1A2E] to-[#16213E] overflow-hidden">
        {/* Animated Background Orbs - Smaller for mobile */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 h-full overflow-y-auto">
          {/* Header - Minimal close button only */}
          <div className="flex justify-end p-3">
            <IonButton
              fill="clear"
              size="small"
              onClick={onClose}
              className="text-white/70"
            >
              ×
            </IonButton>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-6">
            {/* Feature Description - Minimal */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{featureInfo.icon}</div>
              <p className="text-white/90 text-base leading-relaxed">
                {featureInfo.description}
              </p>
            </div>

            {/* Premium Features List - Minimal */}
            <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
              <h3 className="text-white font-medium text-sm mb-2">Pro üyelikle kazanın:</h3>
              <div className="space-y-1">
                <div className="flex items-center text-white/80 text-xs">
                  <span className="text-green-400 mr-2">✓</span>
                  Sınırsız İzleme Listesi
                </div>
                <div className="flex items-center text-white/80 text-xs">
                  <span className="text-green-400 mr-2">✓</span>
                  AI Film Önerileri
                </div>
                <div className="flex items-center text-white/80 text-xs">
                  <span className="text-green-400 mr-2">✓</span>
                  Yorum Geliştirici AI
                </div>
                <div className="flex items-center text-white/80 text-xs">
                  <span className="text-green-400 mr-2">✓</span>
                  Oyuncularla AI Sohbet
                </div>
                <div className="flex items-center text-white/80 text-xs">
                  <span className="text-green-400 mr-2">✓</span>
                  Detaylı İstatistikler
                </div>
              </div>
            </div>

            {/* Pricing Plans - Minimal */}
            <div className="space-y-3">
              {/* Yearly Plan - Popular */}
              <IonButton
                fill={selectedPlan === 'yearly' ? 'solid' : 'outline'}
                expand="block"
                size="default"
                color={selectedPlan === 'yearly' ? 'primary' : 'medium'}
                className="m-0 h-auto"
                onClick={() => setSelectedPlan('yearly')}
              >
                <div className="flex justify-between items-center w-full py-2">
                  <div className="text-left">
                    <div className="text-sm font-semibold">Yıllık Plan</div>
                    <div className="text-xs opacity-70">İlk 1 ay ücretsiz</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold">₺99</div>
                    <div className="text-xs opacity-70 line-through">₺119</div>
                  </div>
                </div>
              </IonButton>

              {/* Monthly Plan */}
              <IonButton
                fill={selectedPlan === 'monthly' ? 'solid' : 'outline'}
                expand="block"
                size="default"
                color={selectedPlan === 'monthly' ? 'primary' : 'medium'}
                className="m-0 h-auto"
                onClick={() => setSelectedPlan('monthly')}
              >
                <div className="flex justify-between items-center w-full py-2">
                  <div className="text-left">
                    <div className="text-sm font-semibold">Aylık Plan</div>
                    <div className="text-xs opacity-70">İstediğin zaman iptal et</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold">₺12</div>
                    <div className="text-xs opacity-70">/ay</div>
                  </div>
                </div>
              </IonButton>
            </div>

            {/* Action Buttons - Minimal */}
            <div className="space-y-3 mt-8">
              <IonButton
                expand="block"
                size="default"
                color="primary"
                onClick={handleSubscribe}
                className="m-0"
              >
                Pro Plana Geç - {selectedPlan === 'yearly' ? 'Yıllık' : 'Aylık'}
              </IonButton>
              
              <IonButton
                expand="block"
                fill="clear"
                size="small"
                color="medium"
                onClick={onClose}
                className="m-0"
              >
                Şimdi Değil
              </IonButton>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 mb-2">
              <p className="text-white/50 text-xs px-2">
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
