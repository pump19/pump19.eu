import { Head } from "$fresh/runtime.ts";
import { JSX } from "preact";
import {
  IconBrandGithub,
  IconBug,
  IconGitFork,
  IconMessage,
  IconSourceCode as IconContribute,
  IconWorldWww,
} from "@tabler/icons-preact";

import { H1, H2 } from "../components/Headings.tsx";
import { P } from "../components/Paragraph.tsx";

function Repository({
  name,
  icon,
  href,
}: {
  name: string;
  icon: JSX.Element;
  href: string;
}) {
  icon.props.size = "1.5rem";
  icon.props.class = "mr-2 self-center";

  return (
    <div class="border-black border rounded-t m-4 p-0 flex flex-col font-bold min-w-80">
      <h3 class="bg-black p-2 text-white text-xl rounded-t flex items-baseline justify-center">
        {icon}
        {name}
      </h3>
      <a
        href={href}
        class="bg-green text-white text-lg p-2 flex items-baseline justify-center"
      >
        <IconGitFork class="mr-2 self-center" />
        Repository
      </a>
      <a
        href={`${href}/issues`}
        class="bg-orange text-white text-lg p-2 flex items-baseline justify-center"
      >
        <IconBug class="mr-2 self-center" />
        Issue Tracker
      </a>
    </div>
  );
}

export default function Contribute() {
  return (
    <>
      <Head>
        <title>Pump19 | Contribute</title>
      </Head>
      <H1 icon={<IconContribute />} content="Contribute to Pump19" />
      <P>
        Do you think Pump19 needs a new <dfn>Chem</dfn>{" "}
        (the magic words that power a golem)? That can be arranged easily
        enough. Pump19 is built upon{" "}
        <abbr title="Free and open-source software">FOSS</abbr>{" "}
        components and is itself released under the{" "}
        <a href="http://opensource.org/licenses/MIT">MIT License</a>.
      </P>
      <P>
        All of Pump19's source code is hosted on{" "}
        <a href="https://github.com/" class="inline-flex items-baseline">
          <IconBrandGithub size="1rem" class="mx-0.5 self-center" />
          GitHub
        </a>
        . There you can suggest new features, report issues, or even fork and
        contribute your own functionality.
      </P>

      <H2 content="Repositories" icon={<IconGitFork />} />
      <P>
        There exist two distinct source code repositories: one for the chat
        golem itself and one for this website.
      </P>

      <section class="flex flex-wrap justify-center">
        <Repository
          name="Pump19 Chat Golem"
          icon={<IconMessage />}
          href="https://github.com/pump19/pump19"
        />
        <Repository
          name="Pump19 Website"
          icon={<IconWorldWww />}
          href="https://github.com/pump19/pump19.eu-fresh"
        />
      </section>
    </>
  );
}