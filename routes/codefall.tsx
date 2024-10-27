import { Head } from "$fresh/runtime.ts";
import {
  FreshContext,
  Handlers,
  PageProps,
  STATUS_CODE,
} from "$fresh/server.ts";

import {
  IconBrandTwitch,
  IconCodePlus,
  IconDeviceGamepad3 as IconGamepad,
  IconGiftFilled as IconCodefall,
  IconInfoHexagon as IconInfo,
  IconKey,
  IconLink,
  IconLogout,
} from "@tabler/icons-preact";

import { LoginRedirect, SessionState } from "../plugins/oauth.ts";

import { H1, H2 } from "../components/Headings.tsx";
import { P } from "../components/Paragraph.tsx";
import {
  addCode,
  getClaimedCodes,
  getGiftedCodeCount,
  getUnclaimedCodes,
  PreviewCode,
} from "../utils/db.ts";
import redirect from "../utils/redirect.ts";

const PUMP19_BASE_URL = Deno.env.get("PUMP19_BASE_URL")!;

// we extend the SessionState with the codes property
type CodefallData = {
  unclaimed: PreviewCode[];
  claimed: PreviewCode[];
  gifted: number;
};

export const handler: Handlers = {
  async GET(_request: Request, context: FreshContext) {
    // for codefall, we require an authenticated session
    // if we don't have one, redirect to the login page
    const session = (context.state as SessionState).session;
    if (!session) {
      return LoginRedirect(context);
    } else {
      const unclaimed = getUnclaimedCodes(session.userId);
      const claimed = getClaimedCodes(session.userId);
      const gifted = getGiftedCodeCount(session.userId);
      return await context.render({ unclaimed, claimed, gifted });
    }
  },
  async POST(request: Request, context: FreshContext) {
    // we shouldn't get here without a session, but better safe than sorry
    const session = (context.state as SessionState).session;
    if (!session) {
      return LoginRedirect(context);
    } else {
      const formData = await request.formData();
      const description = formData.get("description") as string;
      const code = formData.get("code") as string;
      const code_type = formData.get("code_type") as string;
      addCode({
        description,
        code,
        code_type,
        uid_owner: session.userId,
      });

      // when we're done, we redirect back to the codefall page
      return redirect("/codefall", STATUS_CODE.SeeOther);
    }
  },
};

function CodeForm() {
  return (
    <>
      <Head>
        <title>Pump19 | Codefall</title>
      </Head>
      <H1 content="Add a New Entry" />
      <section class="bg-gray-light border border-black rounded-t mx-4">
        <h3 class="bg-gray-dark text-white flex items-baseline gap-4 px-4 py-2 rounded-t font-bold col-span-5">
          <IconCodePlus class="self-center" /> New Codefall Entry
        </h3>
        <form
          action="/codefall"
          method="post"
          accept-charset="utf-8"
          autocomplete="off"
          class="p-4 grid grid-cols-[auto_repeat(5,_1fr)] gap-4 items-baseline"
        >
          <label
            for="codefallDesc"
            class="font-bold inline-flex items-baseline"
          >
            <IconInfo class="mr-2 self-center" />
            Description
          </label>
          <input
            required
            class="p-2 text-black font-bold border-2 border-black invalid:border-red col-span-5"
            type="text"
            name="description"
            id="codefallDesc"
            placeholder="Game of the Year"
            minlength={4}
          />
          <label
            for="codefallCode"
            class="font-bold inline-flex items-baseline"
          >
            <IconKey class="mr-2 self-center" />
            Link or Key
          </label>
          <input
            required
            class="p-2 text-black font-bold font-mono border-2 border-black invalid:border-red col-span-5"
            type="text"
            name="code"
            id="codefallCode"
            placeholder="S3CR3T-D0WNL04D-K3Y"
            minlength={4}
          />
          <label
            for="codefallType"
            class="font-bold inline-flex items-baseline"
          >
            <IconGamepad class="mr-2 self-center" />
            Code Type
          </label>
          <select
            required
            class="p-2 border-2 border-black invalid:border-red col-span-5"
            name="code_type"
            id="codefallType"
          >
            <option>Steam</option>
            <option>Humble Bundle</option>
            <option>GOG</option>
            <option>Epic Games</option>
            <option>Origin</option>
            <option>Other</option>
          </select>

          <button
            type="reset"
            class="bg-yellow border border-black text-black font-bold px-4 py-2 rounded self-center col-start-5"
          >
            Reset
          </button>
          <button
            type="submit"
            class="bg-green border border-black text-white-bright font-bold px-4 py-2 rounded self-center"
          >
            Submit
          </button>
        </form>
      </section>
    </>
  );
}

function CodeUnclaimed({ code }: { code: PreviewCode }) {
  const { key, description, code_type } = code;
  const claimLink = `${PUMP19_BASE_URL}/codefall/${key}`;
  return (
    <details class="bg-gray-light border-black border rounded-t flex flex-col mx-4 mb-4">
      <summary class="bg-gray-dark text-white flex items-baseline gap-4 px-4 py-2 rounded-t font-bold">
        <IconCodefall class="self-center" />
        {description}
        <small>{code_type}</small>
      </summary>
      <P>
        <span class="inline-flex justify-start items-baseline">
          <IconLink size="1rem" class="mr-2 self-center" />
          Claim Link:
          <code class="bg-white-bright text-red-dark mx-1 px-1 font-mono">
            {claimLink}
          </code>
          (or copy this&nbsp;<a href={claimLink}>link</a>)
        </span>
      </P>
      <P>
        <span class="inline-flex justify-start items-baseline">
          <IconBrandTwitch size="1rem" class="mr-2 self-center" />
          Chat Template:
          <code class="bg-white-bright text-red-dark mx-1 px-1 font-mono">
            Codefall | {description} ({code_type}) {claimLink}
          </code>
        </span>
      </P>
    </details>
  );
}

function CodesUnclaimed({ codes }: { codes: PreviewCode[] }) {
  return (
    <>
      <H2 content="Unclaimed Entries" />
      <P>
        You have <strong>{codes.length}</strong> unclaimed&nbsp;
        {codes.length !== 1 ? "entries" : "entry"}. Click on the titles to
        reveal the claim link.
      </P>
      {codes.map((code) => <CodeUnclaimed code={code} />)}
    </>
  );
}

function CodeClaimed({ code }: { code: PreviewCode }) {
  const { key, description, code_type } = code;
  const showLink = `${PUMP19_BASE_URL}/codefall/show/${key}`;
  return (
    <ul class="list-disc list-inside mx-4">
      <li>
        <a href={showLink}>
          {description} <small>({code_type})</small>
        </a>
      </li>
    </ul>
  );
}

function CodesClaimed({ codes }: { codes: PreviewCode[] }) {
  return (
    <>
      <H2 content="Claimed Entries" />
      <P>
        You have claimed a total of <strong>{codes.length}</strong>&nbsp;
        {codes.length !== 1 ? "entries" : "entry"}. Lucky you! You can use the
        links below to view the details of your claimed entries.
      </P>
      {codes.map((code) => <CodeClaimed code={code} />)}
    </>
  );
}

export default function Codefall({ data, state }: PageProps) {
  const session = (state as SessionState).session!;
  const { unclaimed, claimed, gifted } = data as CodefallData;
  return (
    <>
      <Head>
        <title>Pump19 | Codefall</title>
      </Head>
      <H1 icon={<IconCodefall />} content="Codefall" />
      <P>
        On this page you can add new keys and links for codefall and view your
        claimed and unclaimed codefall entries.<br />
        You are logged in as{" "}
        <strong>{session.displayName}</strong>. If this isn't you or you want to
        log in as a different user, please{" "}
        <a
          href="/auth/logout?redirect=/"
          class="inline-flex items-baseline"
        >
          log out <IconLogout class="ml-1 self-center" size="1rem" />
        </a>{" "}
        now.
      </P>
      <CodeForm />
      <CodesUnclaimed codes={unclaimed} />
      <CodesClaimed codes={claimed} />
      <>
        <H2 content="Gifted Entries" />
        <P>
          You have gifted a total of <strong>{gifted}</strong>&nbsp;
          {gifted !== 1 ? "entries" : "entry"}.
        </P>
      </>
    </>
  );
}
