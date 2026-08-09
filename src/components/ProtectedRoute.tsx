import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const SESSION_KEY = 'craftly_session';
const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes (1 hour)

export const setLoginSession = () => {
  const expiry = Date.now() + SESSION_DURATION;
  localStorage.setItem(SESSION_KEY, expiry.toString());
};

export const checkLoginSession = () => {
  const expiryStr = localStorage.getItem(SESSION_KEY);
  if (!expiryStr) return false;
  const expiry = parseInt(expiryStr, 10);
  if (Date.now() > expiry) {
    localStorage.removeItem(SESSION_KEY);
    return false;
  }
  return true;
};

export const clearLoginSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export function ProtectedRoute() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(checkLoginSession());

  useEffect(() => {
    // Re-check authentication strictly every second to ensure 1-hour expiry is enforced
    const interval = setInterval(() => {
      if (!checkLoginSession()) {
        setIsAuthenticated(false);
        navigate('/', { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
