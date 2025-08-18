import React, { createContext, useContext, useState } from 'react';

export type PaywallFeature = 'watchlist-limit' | 'ai-recommendations' | 'comment-enhancer' | 'chat-with-cast' | 'detailed-stats';

interface PaywallContextType {
  isPaywallOpen: boolean;
  currentFeature: PaywallFeature | null;
  openPaywall: (feature: PaywallFeature) => void;
  closePaywall: () => void;
}

const PaywallContext = createContext<PaywallContextType | null>(null);

export const PaywallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<PaywallFeature | null>(null);

  const openPaywall = (feature: PaywallFeature) => {
    setCurrentFeature(feature);
    setIsPaywallOpen(true);
  };

  const closePaywall = () => {
    setIsPaywallOpen(false);
    setCurrentFeature(null);
  };

  return (
    <PaywallContext.Provider 
      value={{
        isPaywallOpen,
        currentFeature,
        openPaywall,
        closePaywall
      }}
    >
      {children}
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};

export default PaywallContext;
