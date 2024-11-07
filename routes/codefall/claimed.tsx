import { IconGiftOff } from "@tabler/icons-preact";

import { Sadface } from "../../components/Sadface.tsx";
import { P } from "../../components/Paragraph.tsx";
import { H1 } from "../../components/Headings.tsx";

export default function Claimed() {
  return (
    <Sadface>
      <H1 icon={<IconGiftOff />}>Already Claimed!"</H1>
      <P>
        Sorry, the code you were trying to view is already claimed by someone
        else. Better luck next time!
      </P>
    </Sadface>
  );
}
