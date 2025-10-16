import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { initializeDeviceFingerprint } from './utils/deviceFingerprint';

import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';

// Initialize device fingerprinting when the app starts
initializeDeviceFingerprint();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);
