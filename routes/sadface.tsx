import {
  IconGiftOff,
  IconMoodLookDown as IconSadface,
} from "@tabler/icons-preact";

import { P } from "../components/Paragraph.tsx";
import { H1 } from "../components/Headings.tsx";

export default function Sadface() {
  return (
    <div class="flex flex-col items-center">
      <IconSadface size="20vw" class="text-white" />
      <H1 icon={<IconGiftOff />} content="Already Claimed!" />
      <P>
        Sorry, the code you were trying to view is already claimed by someone
        else. Better luck next time!
      </P>
    </div>
  );
}
