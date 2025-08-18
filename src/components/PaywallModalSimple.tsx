import React from 'react';
import { IonModal } from '@ionic/react';

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'watchlist-limit' | 'ai-recommendations' | 'comment-enhancer' | 'chat-with-cast' | 'detailed-stats';
  onSubscribe?: (plan: 'monthly' | 'yearly') => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <div className="p-8">
        <h2>Simple Paywall Modal Test</h2>
        <p>Feature: {feature}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </IonModal>
  );
};

export default PaywallModal;
