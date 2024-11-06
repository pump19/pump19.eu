import { Head } from "$fresh/runtime.ts";

import { IconError404 } from "@tabler/icons-preact";

import { Sadface } from "../components/Sadface.tsx";
import { H1 } from "../components/Headings.tsx";
import { P } from "../components/Paragraph.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>Pump19 | Page Not Found</title>
      </Head>
      <Sadface>
        <H1 icon={<IconError404 />} content="Page Not Found" />
        <P>
          Sorry, the page you were trying to view does not exist. Please make
          sure you have the correct URL or return <a href="/">home</a>.
        </P>
      </Sadface>
    </>
  );
}
