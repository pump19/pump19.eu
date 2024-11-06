import { IconMoodLookDown as IconSadface } from "@tabler/icons-preact";
import { ComponentChildren } from "preact";

export function Sadface({ children }: { children: ComponentChildren }) {
  return (
    <section class="flex flex-col items-center">
      <IconSadface size="20vw" class="text-white" />
      {children}
    </section>
  );
}
