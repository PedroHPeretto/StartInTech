/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_E2E?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __STARTINTECH_E2E__?: boolean;
  __STARTINTECH_ROUTER__?: {
    navigate: (options: {
      to: string;
      params?: Record<string, string>;
    }) => Promise<void> | void;
  };
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: Record<string, unknown>,
        ) => void;
      };
    };
  };
}
