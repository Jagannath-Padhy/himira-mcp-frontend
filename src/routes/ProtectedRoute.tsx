// src/routes/ProtectedRoute.tsx
import { isAuthenticated } from '@lib';
import { JSX } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
