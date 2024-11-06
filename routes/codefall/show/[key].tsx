import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import {
  IconDeviceGamepad3 as IconGamepad,
  IconGift as IconCongratulations,
} from "@tabler/icons-preact";

import { LoginRedirect, SessionState } from "../../../plugins/oauth.ts";
import { getClaimedCode } from "../../../utils/db.ts";
import { H1, H2 } from "../../../components/Headings.tsx";
import { P } from "../../../components/Paragraph.tsx";
import redirect from "../../../utils/redirect.ts";

export const handler: Handlers = {
  async GET(_request: Request, context: FreshContext) {
    // for codefall, we require an authenticated session
    // if we don't have one, redirect to the login page
    const session = (context.state as SessionState).session;
    if (!session) {
      return LoginRedirect(context);
    } else {
      const claimedCode = getClaimedCode(context.params.key, session.userId);
      if (claimedCode === undefined) {
        return redirect("/codefall/claimed");
      } else {
        return await context.render(claimedCode);
      }
    }
  },
};

export default function Show({ state, data }: PageProps) {
  const displayName = (state as SessionState).session!.displayName;
  const { description, code_type, code } = data;
  return (
    <>
      <Head>
        <title>Pump19 | Codefall - Claimed Code</title>
      </Head>
      <section class="flex flex-col items-center">
        <H1 icon={<IconCongratulations />} content="Congratulations!" />
        <P>
          <strong>{displayName}</strong>, you have successfully claimed the
          following code:
        </P>
        <H2 icon={<IconGamepad />} content={description} />
        <code class="bg-white text-red-dark text-xl font-bold font-mono p-1 rounded">
          {code}
        </code>
        <P>
          You can redeem this code on <strong>{code_type}</strong>!
        </P>
      </section>
    </>
  );
}
