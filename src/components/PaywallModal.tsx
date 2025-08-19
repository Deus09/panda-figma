import React, { useState, useEffect } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { LocationPricingService, PricingTier } from '../services/locationPricing';

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
  const { t, i18n } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [pricing, setPricing] = useState<PricingTier | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoadingPricing(true);
        const userPricing = await LocationPricingService.getPricingForLocation();
        setPricing(userPricing);
      } catch (error) {
        console.error('Failed to load pricing:', error);
        // Fallback to default pricing (Europe)
        setPricing({
          monthly: 1,
          yearly: 10,
          currency: 'EUR',
          currencySymbol: '€',
          region: 'europe'
        });
      } finally {
        setLoadingPricing(false);
      }
    };

    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  // Feature'a göre başlık ve açıklama
  const getFeatureInfo = () => {
    switch (feature) {
      case 'watchlist-limit':
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
          icon: '📝'
        };
      case 'ai-recommendations':
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
          icon: '🤖'
        };
      case 'comment-enhancer':
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
          icon: '✨'
        };
      case 'chat-with-cast':
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
          icon: '💬'
        };
      case 'detailed-stats':
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
          icon: '📊'
        };
      default:
        return {
          title: t('paywall.title'),
          description: t('paywall.subtitle'),
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
          {/* Close Button */}
          <div className="flex justify-end p-3">
            <IonButton
              fill="clear"
              color="light"
              size="small"
              onClick={onClose}
              className="w-8 h-8 --border-radius: 50%"
            >
              ✕
            </IonButton>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-6">
            {/* Feature Description - Clean & Minimal */}
            <div className="text-center mb-8">
              <h2 className="text-white text-xl font-bold mb-3">{t('paywall.title')}</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                {t('paywall.description')}
              </p>
            </div>

            {/* Premium Features - Soft Color Design */}
            <div className="mb-8">
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/10 rounded-xl p-4 border border-slate-500/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{t('paywall.features.unlimited_ai')}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/10 rounded-xl p-4 border border-slate-500/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                      <span className="text-white text-lg">🎬</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{t('paywall.features.unlimited_movies')}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/10 rounded-xl p-4 border border-slate-500/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                      <span className="text-white text-lg">✨</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{t('paywall.features.comment_enhancement')}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/10 rounded-xl p-4 border border-slate-500/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                      <span className="text-white text-lg">🎭</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{t('paywall.features.character_chat')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Plans - Distinct Colors */}
            <div className="space-y-3">
              {/* Yearly Plan - Popular */}
              <IonButton
                fill={selectedPlan === 'yearly' ? 'solid' : 'outline'}
                expand="block"
                size="default"
                color={selectedPlan === 'yearly' ? 'success' : 'medium'}
                className="m-0 h-auto"
                onClick={() => setSelectedPlan('yearly')}
                disabled={loadingPricing}
              >
                <div className="flex justify-between items-center w-full py-2">
                  <div className="text-left">
                    <div className="text-sm font-semibold">{t('paywall.plans.yearly')}</div>
                    <div className="text-xs opacity-70">{t('paywall.pricing.free_trial')}</div>
                  </div>
                  <div className="text-right">
                    {loadingPricing ? (
                      <div className="text-base font-bold">...</div>
                    ) : pricing ? (
                      <>
                        <div className="text-base font-bold">
                          {LocationPricingService.formatPrice(pricing.yearly, pricing)}
                        </div>
                        <div className="text-xs opacity-70">/{t('common.year')}</div>
                      </>
                    ) : (
                      <div className="text-base font-bold">-</div>
                    )}
                  </div>
                </div>
              </IonButton>

              {/* Monthly Plan */}
              <IonButton
                fill={selectedPlan === 'monthly' ? 'solid' : 'outline'}
                expand="block"
                size="default"
                color={selectedPlan === 'monthly' ? 'secondary' : 'medium'}
                className="m-0 h-auto"
                onClick={() => setSelectedPlan('monthly')}
                disabled={loadingPricing}
              >
                <div className="flex justify-between items-center w-full py-2">
                  <div className="text-left">
                    <div className="text-sm font-semibold">{t('paywall.plans.monthly')}</div>
                    <div className="text-xs opacity-70">{t('paywall.pricing.billing_info', { period: t('paywall.plans.monthly').toLowerCase() })}</div>
                  </div>
                  <div className="text-right">
                    {loadingPricing ? (
                      <div className="text-base font-bold">...</div>
                    ) : pricing ? (
                      <>
                        <div className="text-base font-bold">
                          {LocationPricingService.formatPrice(pricing.monthly, pricing)}
                        </div>
                        <div className="text-xs opacity-70">/{t('common.month')}</div>
                      </>
                    ) : (
                      <div className="text-base font-bold">-</div>
                    )}
                  </div>
                </div>
              </IonButton>
            </div>

            {/* Action Buttons - Distinct Primary Color */}
            <div className="space-y-3 mt-8">
              <IonButton
                expand="block"
                size="default"
                color="primary"
                onClick={handleSubscribe}
                className="m-0"
                disabled={loadingPricing}
              >
                {t('paywall.actions.subscribe')} - {selectedPlan === 'yearly' ? t('paywall.plans.yearly') : t('paywall.plans.monthly')}
              </IonButton>
              
              <IonButton
                expand="block"
                fill="clear"
                size="small"
                color="medium"
                onClick={onClose}
                className="m-0"
              >
                {t('paywall.actions.cancel')}
              </IonButton>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 mb-2">
              <p className="text-white/50 text-xs px-2">
                {t('paywall.pricing.billing_info', { period: selectedPlan === 'yearly' ? t('paywall.plans.yearly').toLowerCase() : t('paywall.plans.monthly').toLowerCase() })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default PaywallModal;
