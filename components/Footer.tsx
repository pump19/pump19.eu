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
    <footer class="border-t-2 border-t-black bg-gray-dark">
      <section class="container py-4 text-center">
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
