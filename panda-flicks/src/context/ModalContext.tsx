import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalType = 'movie' | 'actor' | 'series';
export interface ModalStackItem {
  type: ModalType;
  id: number;
}

interface ModalContextProps {
  modalStack: ModalStackItem[];
  openModal: (type: ModalType, id: number) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalStackItem[]>([]);

  const openModal = (type: ModalType, id: number) => {
    setModalStack((prev) => [...prev, { type, id }]);
  };

  const closeModal = () => {
    setModalStack((prev) => prev.slice(0, -1));
  };

  return (
    <ModalContext.Provider value={{ modalStack, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
