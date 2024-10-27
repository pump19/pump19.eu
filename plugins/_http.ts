import { Cookie, deleteCookie, getCookies } from "@std/http";
import { setCookie } from "@std/http/cookie";

const OAUTH_SESSION_TIMEOUT = 2 * 60;
const SITE_SESSION_TIMEOUT = 24 * 60 * 60;

const COOKIE_BASE = {
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
  path: "/",
} as Partial<Cookie>;

export enum SessionType {
  OAUTH = "oauth-session",
  SITE = "site-session",
}

export function isHttps(url: string): boolean {
  return url.startsWith("https://");
}

export function getCookieName(type: SessionType, isHttps: boolean): string {
  return isHttps ? "__Host-" + type : type;
}

/**
 * Get the redirect URL from the request.
 * - Return the URL from the `redirect` query parameter if it exists.
 * - Return the referrer URL if it exists and is from the same origin.
 * - Return `/` as a fallback.
 *
 * @param request is the request object for which to get the redirect URL.
 * @returns the redirect URL.
 */
export function getRedirectUrl(request: Request): string {
  const requestUrl = new URL(request.url);

  const redirectUrl = requestUrl.searchParams.get("redirect");
  if (redirectUrl !== null) return redirectUrl;

  const referrer = request.headers.get("referer");
  if (referrer !== null && (new URL(referrer).origin === requestUrl.origin)) {
    return referrer;
  }

  return "/";
}

export function redirect(
  location: string,
  status: number,
  cookie?: Cookie,
): Response {
  const response = new Response(null, {
    headers: {
      location,
    },
    status,
  });

  if (cookie) {
    setCookie(response.headers, cookie);
  } else {
    // we remove any existing cookies
    [SessionType.OAUTH, SessionType.SITE].forEach((type) => {
      const secure = isHttps(location);
      deleteCookie(response.headers, getCookieName(type, secure), {
        ...COOKIE_BASE,
        secure,
      });
    });
  }

  return response;
}

export function makeSessionCookie(
  type: SessionType,
  sessionId: string,
  secure: boolean,
): Cookie {
  const cookieName = getCookieName(type, secure);
  const maxAge = type === SessionType.OAUTH
    ? OAUTH_SESSION_TIMEOUT
    : SITE_SESSION_TIMEOUT;

  return {
    ...COOKIE_BASE,
    name: cookieName,
    value: sessionId,
    secure,
    maxAge,
  };
}

export function retrieveSessionCookie(
  request: Request,
  type: SessionType,
): string | undefined {
  const cookieName = getCookieName(type, isHttps(request.url));
  return getCookies(request.headers)[cookieName];
}
