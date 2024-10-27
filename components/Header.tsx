import { JSX } from "preact";
import {
  IconBrandTwitch as IconLogo,
  IconGiftFilled as IconCodefall,
  IconLogin,
  IconLogout,
  IconSourceCode as IconContribute,
  //IconPuzzle as IconBingo,
  //IconTerminal2 as IconCommands,
} from "@tabler/icons-preact";

import { SiteSession } from "../plugins/_session.ts";

interface HeaderProps {
  session: SiteSession | undefined;
  path: string;
}

interface MenuItemProps {
  name: string;
  icon: JSX.Element;
  href: string;
  active: boolean;
}
const menuItems = [
  { name: "Home", icon: <IconLogo />, href: "/" },
  //{ name: "Commands", icon: <IconCommands />, href: "/commands" },
  { name: "Codefall", icon: <IconCodefall />, href: "/codefall" },
  //{ name: "Trope Bingo", icon: <IconBingo />, href: "/bingo" },
  {
    name: "Contribute",
    icon: <IconContribute />,
    href: "/contribute",
  },
];

function MenuItem({ name, href, icon, active }: MenuItemProps) {
  const style = active ? "bg-red text-white" : "text-red";
  icon.props.size = "1.5rem";
  icon.props.class = "mr-1 self-center";

  return (
    <a
      href={href}
      class={`${style} hover:text-white hover:bg-gray px-4 py-4 flex items-center`}
    >
      {icon} {name}
    </a>
  );
}

function AuthItem({ loggedIn }: { loggedIn: boolean }) {
  const commonStyle = "rounded-md m-3 p-2 inline-flex items-baseline";
  if (loggedIn) {
    return (
      <a
        href="/auth/logout?redirect=/"
        class={`bg-gray text-white ${commonStyle}`}
      >
        Logout <IconLogout class="ml-1 self-center" />
      </a>
    );
  } else {
    return (
      <a href="/auth/login" class={`bg-red text-white ${commonStyle}`}>
        <IconLogin class="mr-1 self-center" /> Login
      </a>
    );
  }
}

export default function Header({ session, path }: HeaderProps) {
  return (
    <header class="bg-gray-dark">
      <section class="container flex">
        <nav class="flex">
          {menuItems.map((item) => (
            <MenuItem {...item} active={item.href == path} />
          ))}
        </nav>
        <div class="flex flex-grow justify-end">
          <AuthItem loggedIn={session !== undefined} />
        </div>
      </section>
    </header>
  );
}
