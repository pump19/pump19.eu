import {
  FreshContext,
  Handlers,
  PageProps,
  STATUS_CODE,
} from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { IconGift as IconAlmost } from "@tabler/icons-preact";

import { LoginRedirect, SessionState } from "../../plugins/oauth.ts";
import { getUnclaimedCode, PreviewCode, tryClaim } from "../../utils/db.ts";
import { H1, H2 } from "../../components/Headings.tsx";
import { P } from "../../components/Paragraph.tsx";
import redirect from "../../utils/redirect.ts";

const PUMP19_CAPTCHA_SITEKEY = Deno.env.get("PUMP19_CAPTCHA_SITEKEY") ??
  "10000000-ffff-ffff-ffff-000000000001";
const PUMP19_CAPTCHA_SECRET = Deno.env.get("PUMP19_CAPTCHA_SECRET") ??
  "0x0000000000000000000000000000000000000000";

async function verifyCaptchaResponse(token: string) {
  const formData = new FormData();
  formData.append("secret", PUMP19_CAPTCHA_SECRET);
  formData.append("sitekey", PUMP19_CAPTCHA_SITEKEY);
  formData.append("response", token);

  const url = "https://api.hcaptcha.com/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  const outcome = await result.json();
  return outcome.success ?? false;
}

export const handler: Handlers = {
  async GET(_request: Request, context: FreshContext) {
    // for codefall, we require an authenticated session
    // if we don't have one, redirect to the login page
    const session = (context.state as SessionState).session;
    if (!session) {
      return LoginRedirect(context);
    } else {
      const unclaimedCode = getUnclaimedCode(context.params.key);
      if (unclaimedCode === undefined) {
        return redirect("/sadface");
      } else {
        return await context.render(unclaimedCode);
      }
    }
  },
  async POST(request: Request, context: FreshContext) {
    // we shouldn't get here without a session, but better safe than sorry
    const session = (context.state as SessionState).session;
    if (!session) {
      return LoginRedirect(context);
    } else {
      const formData = await request.formData();
      const token = formData.get("h-captcha-response") as string;

      if (!(await verifyCaptchaResponse(token))) {
        return redirect("/codefall", STATUS_CODE.SeeOther);
      }

      // captcha is valid, try to claim the key and forward accordingly
      const claimee = session.userId;
      const key = context.params.key;
      const success = 1 === tryClaim(key, claimee);

      return redirect(
        success ? `/codefall/show/${key}` : "/sadface",
        STATUS_CODE.SeeOther,
      );
    }
  },
};

export default function Show({ state, data }: PageProps) {
  const displayName = (state as SessionState).session!.displayName;
  const { key, description, code_type } = data as PreviewCode;
  const preview = `${description} (${code_type})`;
  const claimLink = `/codefall/${key}`;
  return (
    <>
      <Head>
        <title>Pump19 | Codefall - Claim Code</title>
        <script async defer src="https://js.hcaptcha.com/1/api.js" />
      </Head>
      <section class="flex flex-col items-center">
        <H1 icon={<IconAlmost />} content="Claim Code" />
        <P>
          <strong>{displayName}</strong>, you're just one step away from
          claiming the following code.
        </P>
        <H2 content={preview} />
        <form
          id="codefall-claim"
          class="flex flex-col items-center"
          action={claimLink}
          method="post"
          accept-charset="utf-8"
          autocomplete="off"
        >
          <div
            class="h-captcha mb-4 min-h-[78px]"
            data-sitekey={PUMP19_CAPTCHA_SITEKEY}
            data-size="normal"
            data-theme="light"
            data-callback="onCaptchaSuccess"
          >
          </div>
        </form>
      </section>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html:
            `function onCaptchaSuccess(_token) { document.getElementById("codefall-claim").submit(); }
          `,
        }}
      />
    </>
  );
}
