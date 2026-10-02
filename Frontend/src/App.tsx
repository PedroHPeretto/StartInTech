import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthProvider } from '@/auth/AuthContext';
import { useAuth } from '@/auth/use-auth';
import { router } from '@/routes/route-tree';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function AppRouter() {
  const auth = useAuth();

  useEffect(() => {
    if (
      import.meta.env.VITE_E2E === 'true' ||
      window.__STARTINTECH_E2E__ === true
    ) {
      window.__STARTINTECH_ROUTER__ = router;
    }
  }, []);

  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
