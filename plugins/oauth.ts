import {
  type FreshContext,
  type Plugin,
  type PluginMiddleware,
  type PluginRoute,
  STATUS_CODE,
} from "$fresh/server.ts";
import * as oauth from "@panva/oauth4webapi";
import {
  getRedirectUrl,
  isHttps,
  makeSessionCookie,
  redirect,
  retrieveSessionCookie,
  SessionType,
} from "./_http.ts";
import { sessionStore, SiteSession } from "./_session.ts";

const PUMP19_TWITCH_CLIENT_ID = Deno.env.get("PUMP19_TWITCH_CLIENT_ID")!;
const PUMP19_TWITCH_CLIENT_SECRET = Deno.env.get(
  "PUMP19_TWITCH_CLIENT_SECRET",
)!;
const PUMP19_AUTH_CALLBACK_URL = Deno.env.get("PUMP19_AUTH_CALLBACK_URL")!;

// we really only need the display name
// `sub` contains the user ID, which we use internall
// in the UI, we want to display the user's name
const CLAIMS = JSON.stringify({ id_token: { preferred_username: null } });

// oauth4webapi discovers the endpoints for the Twitch OAuth2 provider
const TWITCH_ISSUER = new URL("https://id.twitch.tv/oauth2");

const authorizationServer = await oauth
  .discoveryRequest(TWITCH_ISSUER, { algorithm: "oidc" })
  .then((response) => oauth.processDiscoveryResponse(TWITCH_ISSUER, response));

const oauthClient: oauth.Client = { client_id: PUMP19_TWITCH_CLIENT_ID };

export type SessionState = {
  session: SiteSession | undefined;
};

export function LoginRedirect(context: FreshContext) {
  const loginUrl = new URL(context.url);
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("redirect", context.route);

  return redirect(loginUrl.toString(), STATUS_CODE.Found);
}

const Routes: PluginRoute[] = [
  {
    path: "/auth/login",
    /**
     * Start the OAuth2 login flow.
     * We redirect the user to the Twitch login page so they can give us permission.
     * The process is completed in the callback route.
     */
    handler: async (request: Request) => {
      // this session ID, as well as the state and nonce, are used only for this request
      // for the proper site session, we will create a new session ID
      const sessionId = crypto.randomUUID();
      const state = oauth.generateRandomState();
      const nonce = oauth.generateRandomNonce();

      const authorizationUrl = new URL(
        authorizationServer.authorization_endpoint!,
      );
      authorizationUrl.searchParams.set("claims", CLAIMS);
      authorizationUrl.searchParams.set("client_id", oauthClient.client_id);
      authorizationUrl.searchParams.set("scope", "openid");
      authorizationUrl.searchParams.set("response_type", "code");
      authorizationUrl.searchParams.set("force_verify", "true");
      authorizationUrl.searchParams.set("state", state);
      authorizationUrl.searchParams.set("nonce", nonce);
      authorizationUrl.searchParams.set(
        "redirect_uri",
        PUMP19_AUTH_CALLBACK_URL,
      );

      // Set the OAuth session ID cookie.
      // This is used to store the state and nonce for the callback.
      // We delete this session after the callback is processed.
      const secure = isHttps(request.url);
      const sessionCookie = makeSessionCookie(
        SessionType.OAUTH,
        sessionId,
        secure,
      );

      // Store the OAuth session in the session store.
      // This is also only used for the callback.
      await sessionStore.setOAuthSession(sessionId, {
        state,
        nonce,
        successUrl: getRedirectUrl(request),
      });

      return redirect(
        authorizationUrl.toString(),
        STATUS_CODE.Found,
        sessionCookie,
      );
    },
  },
  {
    path: "/auth/callback",
    /**
     * Handle the OAuth2 callback from Twitch.
     * We validate the response and exchange the authorization code for an access token.
     * We then use the access token to get and ID token, from which we can extract both the user ID and display name.
     * This information is stored in a site session for future use.
     */
    handler: async (request: Request) => {
      const oauthSessionId = retrieveSessionCookie(request, SessionType.OAUTH);
      if (oauthSessionId === undefined) {
        console.warn("No OAuth session ID found");
        return redirect("/", STATUS_CODE.SeeOther);
      }
      const oauthSession = await sessionStore.cutOAuthSession(oauthSessionId);
      if (oauthSession === undefined) {
        console.warn("No OAuth session found");
        return redirect("/", STATUS_CODE.SeeOther);
      }

      let params: URLSearchParams;
      try {
        params = oauth.validateAuthResponse(
          authorizationServer,
          oauthClient,
          new URL(request.url),
          oauthSession.state,
        );
      } catch (error) {
        console.warn(
          "Invalid OAuth response:",
          (error as oauth.AuthorizationResponseError).error_description ??
            "unknown error",
        );
        return redirect("/", STATUS_CODE.SeeOther);
      }

      const getResponse = async () => {
        const clientAuth = oauth.ClientSecretPost(PUMP19_TWITCH_CLIENT_SECRET);
        const codeVerifier = oauth.generateRandomCodeVerifier();
        const origResponse = await oauth.authorizationCodeGrantRequest(
          authorizationServer,
          oauthClient,
          clientAuth,
          params,
          PUMP19_AUTH_CALLBACK_URL,
          codeVerifier,
        );

        // the library has an issue with how the respone is formatted
        // create a response that flattens the `scope` entry when json() is called
        const origBody = await origResponse.json();
        const fixedResponse = new Response(
          JSON.stringify({
            ...origBody,
            scope: origBody.scope.join(" "),
          }),
          origResponse,
        );

        return fixedResponse;
      };

      const result = await oauth.processAuthorizationCodeResponse(
        authorizationServer,
        oauthClient,
        await getResponse(),
        {
          expectedNonce: oauthSession.nonce,
          requireIdToken: true,
        },
      );
      const claims = oauth.getValidatedIdTokenClaims(result)!;

      // for this, we can now set up the site session
      const siteSessionId = crypto.randomUUID();
      const siteSessionCookie = makeSessionCookie(
        SessionType.SITE,
        siteSessionId,
        isHttps(request.url),
      );

      await sessionStore.setSiteSession(siteSessionId, {
        userId: Number(claims.sub),
        displayName: claims.preferred_username as string,
      });

      return redirect(
        oauthSession.successUrl,
        STATUS_CODE.Found,
        siteSessionCookie,
      );
    },
  },
  {
    path: "/auth/logout",
    /**
     * Logout by deleting the site session.
     * The cookie is deleted in the redirect.
     * Should the user log in again, a new session and cookie will be created.
     */
    handler: async (request: Request) => {
      const siteSessionId = retrieveSessionCookie(request, SessionType.SITE);
      if (siteSessionId !== undefined) {
        await sessionStore.delSiteSession(siteSessionId);
      }

      const redirectUrl = getRedirectUrl(request);
      return redirect(redirectUrl, STATUS_CODE.Found);
    },
  },
];

/**
 * Middleware to check for a valid site session.
 * If a valid session is found, it is stored in the context.
 */
const SiteSessionMiddleware: PluginMiddleware<SessionState> = {
  path: "/",
  middleware: {
    handler: async (request: Request, context: FreshContext<SessionState>) => {
      const siteSessionId = retrieveSessionCookie(request, SessionType.SITE);
      const session = siteSessionId
        ? await sessionStore.getSiteSession(siteSessionId)
        : undefined;

      context.state.session = session;

      return await context.next();
    },
  },
};

/**
 * This plugin provides OAuth2 login and logout functionality.
 * It adds routes for login, validation, and logout.
 * It also provides a middleware to check for a valid session.
 */
export default function oauthPlugin() {
  return {
    name: "oauth",
    routes: Routes,
    middlewares: [SiteSessionMiddleware],
  } as Plugin;
}
