import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ModalProvider } from '../../src/context/ModalContext';
import { AuthProvider } from '../../src/context/AuthContext';
import { NetworkProvider } from '../../src/context/NetworkContext';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </NetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
