import { ReactNode } from 'react';
import { DesignSystemProvider } from '@styles';
import AppRoutes from '@routes';

function AppRoot({ children }: { children: ReactNode }) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
}

function App() {
  return (
    <AppRoot>
      <AppRoutes />
    </AppRoot>
  );
}

export default App;
