import { useGoogleOAuth } from '@react-oauth/google';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import googleIcon from '@/assets/icons/google-icon.svg';
import { BrandHeader } from '@/components/brand/brand-header';
import { Button } from '@/components/ui/button';
import { authenticateWithGoogle } from '@/auth/auth-api';
import { useAuth } from '@/auth/use-auth';
import { getPostAuthRoute } from '@/auth/redirect-after-auth';

function isE2EMode(): boolean {
  if (import.meta.env.VITE_E2E === 'true') {
    return true;
  }
  if (import.meta.env.VITE_GOOGLE_CLIENT_ID === 'e2e-google-client-id') {
    return true;
  }
  return typeof window !== 'undefined' && window.__STARTINTECH_E2E__ === true;
}

export function LoginPage() {
  const isE2E = isE2EMode();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const gsiContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredential = useCallback(
    async (idToken: string) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const response = await authenticateWithGoogle(idToken);
        flushSync(() => {
          setSession(response);
        });
        await navigate({ to: getPostAuthRoute(response.isProfileComplete) });
      } catch {
        setError('Não foi possível entrar com Google. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, setSession],
  );

  useEffect(() => {
    if (isE2E) {
      return;
    }
    if (!scriptLoadedSuccessfully || !gsiContainerRef.current || !clientId) {
      return;
    }
    const google = window.google;
    if (!google?.accounts?.id) {
      return;
    }

    const container = gsiContainerRef.current;
    container.replaceChildren();

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        const credential = credentialResponse.credential;
        if (credential) {
          void handleCredential(credential);
        }
      },
    });

    google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: container.offsetWidth || 320,
      text: 'continue_with',
      locale: 'pt-BR',
    });
  }, [clientId, scriptLoadedSuccessfully, handleCredential, isE2E]);

  const handleE2ELogin = () => {
    void handleCredential('e2e-mock-google-id-token');
  };

  const googleButtonClassName =
    'w-full gap-2 border border-slate-200 bg-white text-brand-midnight shadow-sm hover:bg-slate-50';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-blue px-4">
      <div className="w-full max-w-md rounded-3xl bg-white px-8 py-10 shadow-xl sm:px-10">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>

        <h1 className="font-heading text-center text-2xl font-bold text-brand-midnight">
          Entrar na StartInTech
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Use sua conta Google para continuar.
        </p>

        <div className="mt-8">
          {isE2E ? (
            <Button
              type="button"
              size="lg"
              className={googleButtonClassName}
              data-testid="google-login-button"
              disabled={isSubmitting}
              onClick={handleE2ELogin}
            >
              <img src={googleIcon} alt="" className="size-5" aria-hidden />
              Continuar com Google
            </Button>
          ) : (
            <div className="w-full">
              {!scriptLoadedSuccessfully || !clientId || isSubmitting ? (
                <Button
                  type="button"
                  size="lg"
                  className={googleButtonClassName}
                  disabled
                  data-testid="google-login-button"
                >
                  <img src={googleIcon} alt="" className="size-5" aria-hidden />
                  {isSubmitting ? 'Entrando…' : 'Continuar com Google'}
                </Button>
              ) : null}
              <div
                ref={gsiContainerRef}
                className={`flex w-full justify-center overflow-hidden rounded-4xl border border-slate-200 bg-white py-0.5 shadow-sm ${
                  !scriptLoadedSuccessfully || !clientId || isSubmitting
                    ? 'hidden'
                    : ''
                }`}
                data-testid={
                  scriptLoadedSuccessfully && clientId && !isSubmitting
                    ? 'google-login-button'
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-4 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
