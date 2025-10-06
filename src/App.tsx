import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DesignSystemProvider } from '@styles';
import AppRoutes from '@routes';

const queryClient = new QueryClient();

function AppRoot({ children }: { children: ReactNode }) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
}

function App() {
  return (
    <AppRoot>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </AppRoot>
  );
}

export default App;
