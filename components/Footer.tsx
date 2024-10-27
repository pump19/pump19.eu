import { JSX } from "preact";

import {
  IconBrandDeno,
  IconBrandTabler,
  IconCopyleft,
  IconLemon,
} from "@tabler/icons-preact";

function Link({
  name,
  href,
  icon,
}: {
  name: string;
  href: string;
  icon: JSX.Element;
}) {
  icon.props.class = "mx-0.5 self-center";
  icon.props.size = "1rem";
  return (
    <a href={href} class="inline-flex items-baseline">
      {icon}
      {name}
    </a>
  );
}

export default function Footer() {
  return (
    <footer class="bg-gray-dark border-t-black border-t-2">
      <section class="container text-center py-4">
        <p>
          Powered by
          <Link name="Deno" href="https://deno.com" icon={<IconBrandDeno />} />,
          <Link
            name="Fresh"
            href="https://fresh.deno.dev"
            icon={<IconLemon />}
          />
          , and
          <Link
            name="Tabler Icons"
            href="https://tablericons.com"
            icon={<IconBrandTabler />}
          />
        </p>
        <p class="inline-flex items-baseline">
          <IconCopyleft class="mx-0.5 self-center" size="1rem" />{" "}
          2015-2024 Kevin Perry
        </p>
      </section>
    </footer>
  );
}
