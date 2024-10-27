import { ComponentChildren } from "preact";

export function P({ children }: { children: ComponentChildren }) {
  return <p class="p-2">{children}</p>;
}
