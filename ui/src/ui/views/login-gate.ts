import { html } from "lit";
import { t } from "../../i18n/index.ts";
import type { AppViewState } from "../app-view-state.ts";
import { icons } from "../icons.ts";
import { normalizeBasePath } from "../navigation.ts";
import { agentLogoUrl } from "./agents-utils.ts";

const LOGIN_THEME_OPTIONS = [
  { id: "light", label: "Light", icon: icons.sun },
  { id: "dark", label: "Dark", icon: icons.moon },
  { id: "system", label: "System", icon: icons.monitor },
] as const;

function googleButtonLabel(state: AppViewState): string {
  if (state.googleSignInBusy) {
    return "Connecting to Google…";
  }
  if (state.settings.googleProfileEmail) {
    return `Signed in as ${state.settings.googleProfileEmail}`;
  }
  return "Continue with Google";
}

function renderGoogleBadge() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.23h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.88-1.73 2.99-4.27 2.99-7.52Z"
      ></path>
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.45l-3.22-2.5c-.9.6-2.05.96-3.41.96-2.62 0-4.84-1.77-5.63-4.15H3.03v2.58A10 10 0 0 0 12 22Z"
      ></path>
      <path
        fill="#FBBC04"
        d="M6.37 13.86A5.99 5.99 0 0 1 6.05 12c0-.65.11-1.27.32-1.86V7.56H3.03A10 10 0 0 0 2 12c0 1.61.39 3.13 1.03 4.44l3.34-2.58Z"
      ></path>
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.97 2.95 14.7 2 12 2A10 10 0 0 0 3.03 7.56l3.34 2.58C7.16 7.75 9.38 5.98 12 5.98Z"
      ></path>
    </svg>
  `;
}

export function renderLoginGate(state: AppViewState) {
  const basePath = normalizeBasePath(state.basePath ?? "");
  const faviconSrc = agentLogoUrl(basePath);
  const googleProfileActive = Boolean(state.settings.googleProfileEmail.trim());
  const googleLoginRequired = state.settings.googleLoginRequired;
  const googleGateLocked = googleLoginRequired && !googleProfileActive;
  const emailNotificationsReady =
    state.settings.emailNotificationsEnabled &&
    state.settings.emailNotificationsRecipient.trim().length > 0;

  return html`
    <div class="login-gate">
      <div class="login-gate__theme" role="group" aria-label="Color mode">
        ${LOGIN_THEME_OPTIONS.map(
          (option) => html`
            <button
              type="button"
              class="btn btn--icon ${state.themeMode === option.id ? "active" : ""}"
              title=${option.label}
              aria-label=${option.label}
              aria-pressed=${state.themeMode === option.id}
              @click=${(event: Event) => {
                const target = event.currentTarget as HTMLElement;
                state.setThemeMode(option.id, {
                  source: target,
                  origin: { x: window.innerWidth - 32, y: 32 },
                });
              }}
            >
              ${option.icon}
            </button>
          `,
        )}
      </div>
      <div class="login-gate__card">
        <div class="login-gate__header">
          <img class="login-gate__logo" src=${faviconSrc} alt="OpenClaw" />
          <div class="login-gate__title">OpenClaw</div>
          <div class="login-gate__sub">${t("login.subtitle")}</div>
        </div>

        <div class="login-gate__section">
          <div class="login-gate__section-header">
            <div>
              <div class="login-gate__section-title">Google login</div>
              <div class="login-gate__section-subtitle">
                Add an OAuth client ID to unlock the dashboard with Google before connecting.
              </div>
            </div>
            <label class="field-inline checkbox">
              <input
                type="checkbox"
                .checked=${googleLoginRequired}
                @change=${(e: Event) =>
                  state.applySettings({
                    ...state.settings,
                    googleLoginRequired: (e.target as HTMLInputElement).checked,
                  })}
              />
              <span>Require Google</span>
            </label>
          </div>
          <div class="login-gate__google-grid">
            <label class="field">
              <span>Google OAuth client ID</span>
              <input
                .value=${state.settings.googleClientId}
                @input=${(e: Event) =>
                  state.applySettings({
                    ...state.settings,
                    googleClientId: (e.target as HTMLInputElement).value,
                  })}
                placeholder="1234567890-abc123.apps.googleusercontent.com"
              />
            </label>
            <div class="login-gate__google-actions">
              <button
                type="button"
                class="btn login-gate__google-btn"
                ?disabled=${state.googleSignInBusy || !state.settings.googleClientId.trim()}
                @click=${() => void state.startGoogleLogin()}
              >
                <span class="login-gate__google-icon">${renderGoogleBadge()}</span>
                <span>${googleButtonLabel(state)}</span>
              </button>
              ${
                googleProfileActive
                  ? html`
                      <button
                        type="button"
                        class="btn"
                        @click=${() => state.signOutGoogleLogin()}
                      >
                        Sign out
                      </button>
                    `
                  : ""
              }
            </div>
          </div>
          ${
            googleProfileActive
              ? html`
                  <div class="login-gate__identity-card">
                    ${
                      state.settings.googleProfileAvatar
                        ? html`
                            <img
                              class="login-gate__identity-avatar"
                              src=${state.settings.googleProfileAvatar}
                              alt=${state.settings.googleProfileName || state.settings.googleProfileEmail}
                            />
                          `
                        : html`
                            <div class="login-gate__identity-avatar login-gate__identity-avatar--placeholder">G</div>
                          `
                    }
                    <div>
                      <div class="login-gate__identity-title">
                        ${state.settings.googleProfileName || "Google account"}
                      </div>
                      <div class="login-gate__identity-subtitle">
                        ${state.settings.googleProfileEmail}
                      </div>
                    </div>
                  </div>
                `
              : ""
          }
          ${
            state.googleLoginError
              ? html`<div class="callout danger" style="margin-top: 12px;">${state.googleLoginError}</div>`
              : ""
          }
        </div>

        <div class="login-gate__section">
          <div class="login-gate__section-header">
            <div>
              <div class="login-gate__section-title">Gateway access</div>
              <div class="login-gate__section-subtitle">
                ${
                  googleGateLocked
                    ? "Google sign-in is required before the gateway form unlocks."
                    : "Connect this browser to your gateway with a URL, token, or password."
                }
              </div>
            </div>
            ${
              googleGateLocked
                ? html`
                    <span class="pill">Locked</span>
                  `
                : html`
                    <span class="pill pill--sm">Ready</span>
                  `
            }
          </div>
          <div class="login-gate__form">
            <label class="field">
              <span>${t("overview.access.wsUrl")}</span>
              <input
                ?disabled=${googleGateLocked}
                .value=${state.settings.gatewayUrl}
                @input=${(e: Event) => {
                  const v = (e.target as HTMLInputElement).value;
                  state.applySettings({ ...state.settings, gatewayUrl: v });
                }}
                placeholder="ws://127.0.0.1:18789"
              />
            </label>
            <label class="field">
              <span>${t("overview.access.token")}</span>
              <div class="login-gate__secret-row">
                <input
                  ?disabled=${googleGateLocked}
                  type=${state.loginShowGatewayToken ? "text" : "password"}
                  autocomplete="off"
                  spellcheck="false"
                  .value=${state.settings.token}
                  @input=${(e: Event) => {
                    const v = (e.target as HTMLInputElement).value;
                    state.applySettings({ ...state.settings, token: v });
                  }}
                  placeholder="OPENCLAW_GATEWAY_TOKEN (${t("login.passwordPlaceholder")})"
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === "Enter" && !googleGateLocked) {
                      state.connect();
                    }
                  }}
                />
                <button
                  type="button"
                  class="btn btn--icon ${state.loginShowGatewayToken ? "active" : ""}"
                  title=${state.loginShowGatewayToken ? "Hide token" : "Show token"}
                  aria-label="Toggle token visibility"
                  aria-pressed=${state.loginShowGatewayToken}
                  ?disabled=${googleGateLocked}
                  @click=${() => {
                    state.loginShowGatewayToken = !state.loginShowGatewayToken;
                  }}
                >
                  ${state.loginShowGatewayToken ? icons.eye : icons.eyeOff}
                </button>
              </div>
            </label>
            <label class="field">
              <span>${t("overview.access.password")}</span>
              <div class="login-gate__secret-row">
                <input
                  ?disabled=${googleGateLocked}
                  type=${state.loginShowGatewayPassword ? "text" : "password"}
                  autocomplete="off"
                  spellcheck="false"
                  .value=${state.password}
                  @input=${(e: Event) => {
                    const v = (e.target as HTMLInputElement).value;
                    state.password = v;
                  }}
                  placeholder=${t("login.passwordPlaceholder")}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === "Enter" && !googleGateLocked) {
                      state.connect();
                    }
                  }}
                />
                <button
                  type="button"
                  class="btn btn--icon ${state.loginShowGatewayPassword ? "active" : ""}"
                  title=${state.loginShowGatewayPassword ? "Hide password" : "Show password"}
                  aria-label="Toggle password visibility"
                  aria-pressed=${state.loginShowGatewayPassword}
                  ?disabled=${googleGateLocked}
                  @click=${() => {
                    state.loginShowGatewayPassword = !state.loginShowGatewayPassword;
                  }}
                >
                  ${state.loginShowGatewayPassword ? icons.eye : icons.eyeOff}
                </button>
              </div>
            </label>
            <button
              class="btn primary login-gate__connect"
              ?disabled=${googleGateLocked}
              @click=${() => state.connect()}
            >
              ${googleGateLocked ? "Continue with Google first" : t("common.connect")}
            </button>
          </div>
        </div>

        <div class="login-gate__section">
          <div class="login-gate__section-header">
            <div>
              <div class="login-gate__section-title">Email notifications</div>
              <div class="login-gate__section-subtitle">
                Prepare alert emails in your default mail app when the dashboard needs attention.
              </div>
            </div>
            <label class="field-inline checkbox">
              <input
                type="checkbox"
                .checked=${state.settings.emailNotificationsEnabled}
                @change=${(e: Event) =>
                  state.applySettings({
                    ...state.settings,
                    emailNotificationsEnabled: (e.target as HTMLInputElement).checked,
                  })}
              />
              <span>Enable</span>
            </label>
          </div>
          <label class="field">
            <span>Recipient email</span>
            <input
              .value=${state.settings.emailNotificationsRecipient}
              @input=${(e: Event) =>
                state.applySettings({
                  ...state.settings,
                  emailNotificationsRecipient: (e.target as HTMLInputElement).value,
                })}
              placeholder="alerts@example.com"
            />
          </label>
          <div class="login-gate__notification-actions">
            <button
              type="button"
              class="btn"
              ?disabled=${!emailNotificationsReady}
              @click=${() => state.sendTestNotificationEmail()}
            >
              Send test email
            </button>
            <button
              type="button"
              class="btn"
              ?disabled=${!emailNotificationsReady}
              @click=${() =>
                state.draftNotificationEmail(
                  "Manual dashboard check-in",
                  "This draft was generated from the login screen.",
                )}
            >
              Draft summary email
            </button>
          </div>
        </div>

        ${
          state.lastError
            ? html`<div class="callout danger" style="margin-top: 14px;">
                <div>${state.lastError}</div>
                ${
                  emailNotificationsReady
                    ? html`
                        <button
                          type="button"
                          class="btn danger"
                          style="margin-top: 12px;"
                          @click=${() => state.draftNotificationEmail("Gateway connection error", state.lastError ?? undefined)}
                        >
                          Draft alert email
                        </button>
                      `
                    : ""
                }
              </div>`
            : ""
        }
        <div class="login-gate__help">
          <div class="login-gate__help-title">${t("overview.connection.title")}</div>
          <ol class="login-gate__steps">
            <li>${t("overview.connection.step1")}<code>openclaw gateway run</code></li>
            <li>${t("overview.connection.step2")}<code>openclaw dashboard --no-open</code></li>
            <li>${t("overview.connection.step3")}</li>
          </ol>
          <div class="login-gate__docs">
            <a
              class="session-link"
              href="https://docs.openclaw.ai/web/dashboard"
              target="_blank"
              rel="noreferrer"
            >${t("overview.connection.docsLink")}</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
