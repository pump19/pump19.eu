/// <reference lib="deno.unstable" />

/// Temporary session used for OAuth flow.
interface OAuthSession {
  state: string;
  nonce: string;
  successUrl: string;
}

/// Permanent session used for site sessions.
export interface SiteSession {
  userId: number;
  displayName: string;
}

/**
 * Helper class for storing session data in the KV store.
 * It provides methods for both OAuth and site sessions.
 *
 * OAuth sessions are stored for a short time to allow the user to complete the OAuth flow.
 * Site sessions are stored for a longer time to keep the user logged in.
 */
export class SessionStore {
  constructor(private store: Deno.Kv) {
    onbeforeunload = () => this.store.close();
  }

  private readonly OAUTH_SESSION_TIMEOUT = 2 * 60 * 1000;
  private readonly SITE_SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

  /// Get the key for an OAuth session.
  private static oauthSessionKey(id: string): [string, string] {
    return ["oauth_sessions", id];
  }

  /// Get the key for a site session.
  private static siteSessionKey(id: string): [string, string] {
    return ["site_sessions", id];
  }

  /// Add a temporary OAuth session to the store.
  async setOAuthSession(id: string, value: OAuthSession) {
    const key = SessionStore.oauthSessionKey(id);
    await this.store.set(key, value, {
      expireIn: this.OAUTH_SESSION_TIMEOUT,
    });
  }

  /// Retrieve and delete a temporary OAuth session from the store.
  async cutOAuthSession(id: string) {
    const key = SessionStore.oauthSessionKey(id);
    const oauthSessionRes = await this.store.get<OAuthSession>(key);
    const oauthSession = oauthSessionRes.value;

    await this.store.atomic().check(oauthSessionRes).delete(key).commit();

    return oauthSession ?? undefined;
  }

  /// Add a permanent site session to the store.
  async setSiteSession(id: string, value: SiteSession) {
    const key = SessionStore.siteSessionKey(id);
    await this.store.set(key, value, {
      expireIn: this.SITE_SESSION_TIMEOUT,
    });
  }

  /// Get a permanent site session from the store.
  async getSiteSession(id: string) {
    const key = SessionStore.siteSessionKey(id);
    const siteSessionRes = await this.store.get<SiteSession>(key);
    return siteSessionRes.value ?? undefined;
  }

  /// Remove a permanent site session from the store.
  async delSiteSession(id: string) {
    const key = SessionStore.siteSessionKey(id);
    await this.store.delete(key);
  }
}

/// Global session store for the application.
const SessionDbPath = Deno.env.get("PUMP19_SESSION_DATABASE");
export const sessionStore = new SessionStore(
  await Deno.openKv(SessionDbPath ?? ":memory:"),
);
