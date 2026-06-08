'use client';

import { useEffect, useRef, useState } from 'react';

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_black' | 'filled_blue';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const scriptId = 'google-identity-services';

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  onCredential,
  text = 'continue_with',
}: {
  onCredential: (idToken: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [readyError, setReadyError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID ??
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setReadyError('Google sign-in is not configured.');
      return undefined;
    }

    let cancelled = false;

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
            }
          },
        });
        setIsReady(true);
      })
      .catch(() => setReadyError('Google sign-in could not be loaded.'));

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, text]);

  const label = text === 'signin_with'
    ? 'Sign in with Google'
    : text === 'signup_with'
      ? 'Sign up with Google'
      : 'Continue with Google';

  if (readyError) {
    return (
      <div className="rounded-xl border border-surface-border/70 bg-surface-card/80 px-4 py-3 text-center text-sm text-text-muted">
        {readyError}
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={!isReady}
      onClick={() => window.google?.accounts?.id?.prompt()}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#DB4437] bg-[#DB4437] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#DB4437]/20 transition hover:bg-[#c23327] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-bold text-[#4285F4]">
        G
      </span>
      {isReady ? label : 'Loading Google sign-in...'}
    </button>
  );
}
