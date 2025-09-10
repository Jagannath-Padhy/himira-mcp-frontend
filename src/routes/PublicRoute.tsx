// src/routes/PublicRoute.tsx
import { isAuthenticated } from '@lib';
import { JSX } from 'react';
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }: { children: JSX.Element }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
