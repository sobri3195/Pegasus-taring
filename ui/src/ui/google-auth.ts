export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
  subject: string;
};

type GoogleIdCredentialResponse = {
  credential: string;
};

type GoogleAccountsId = {
  initialize: (params: {
    client_id: string;
    callback: (response: GoogleIdCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  prompt: () => void;
};

type GoogleAccounts = {
  id: GoogleAccountsId;
};

type GoogleGlobal = {
  accounts: GoogleAccounts;
};

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in requires a browser environment."));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (googleScriptPromise) {
    return googleScriptPromise;
  }
  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google sign-in.")),
        {
          once: true,
        },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")), {
      once: true,
    });
    document.head.append(script);
  });
  return googleScriptPromise;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1] ?? "";
  if (!payload) {
    throw new Error("Google sign-in returned an invalid credential payload.");
  }
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const json = globalThis.atob(padded);
  return JSON.parse(json) as Record<string, unknown>;
}

function profileFromCredential(credential: string): GoogleProfile {
  const payload = decodeJwtPayload(credential);
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const subject = typeof payload.sub === "string" ? payload.sub.trim() : "";
  const picture = typeof payload.picture === "string" ? payload.picture.trim() : undefined;
  if (!email || !name || !subject) {
    throw new Error("Google sign-in did not return a usable profile.");
  }
  return { email, name, picture, subject };
}

export async function signInWithGoogle(clientId: string): Promise<GoogleProfile> {
  const normalizedClientId = clientId.trim();
  if (!normalizedClientId) {
    throw new Error("Add a Google OAuth client ID before continuing.");
  }
  await loadGoogleIdentityScript();
  const accountsId = window.google?.accounts?.id;
  if (!accountsId) {
    throw new Error("Google sign-in is unavailable right now.");
  }
  return new Promise<GoogleProfile>((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      fn();
    };
    accountsId.initialize({
      client_id: normalizedClientId,
      cancel_on_tap_outside: true,
      callback: (response) => {
        finish(() => {
          try {
            resolve(profileFromCredential(response.credential));
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      },
    });
    try {
      accountsId.prompt();
      window.setTimeout(() => {
        finish(() => reject(new Error("Google sign-in did not complete. Try again.")));
      }, 60_000);
    } catch (error) {
      finish(() => reject(error instanceof Error ? error : new Error(String(error))));
    }
  });
}
