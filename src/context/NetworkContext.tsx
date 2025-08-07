import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkStatus, NetworkStatus } from '../hooks/useNetworkStatus';

interface NetworkContextType extends NetworkStatus {
  // Gelecekte ilave fonksiyonlar ekleyebiliriz
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const networkStatus = useNetworkStatus();

  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
