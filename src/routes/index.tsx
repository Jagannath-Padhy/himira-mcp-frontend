// src/routes/index.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Chat, Login } from '@views';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
