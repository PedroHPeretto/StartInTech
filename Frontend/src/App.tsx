import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '@/auth/AuthContext';
import { useAuth } from '@/auth/use-auth';
import { router } from '@/routes/route-tree';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function AppRouter() {
  const auth = useAuth();
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
