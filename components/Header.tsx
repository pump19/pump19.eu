import { JSX } from "preact";
import {
  IconBrandTwitch as IconLogo,
  IconGiftFilled as IconCodefall,
  IconLogin,
  IconLogout,
  IconMenu2 as IconMenu,
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

export function Home({ active }: { active: boolean }) {
  const background = active ? "bg-gray" : "bg-gray-dark";
  return (
    <a
      href="/"
      class={[
        "flex items-center text-white hover:bg-gray p-4",
        background,
      ].join(" ")}
    >
      <IconLogo size="2.5rem" class="mr-1" />
      <h1 class="text-3xl font-bold">Pump19</h1>
    </a>
  );
}

function MenuItem({ name, href, icon, active }: MenuItemProps) {
  const style = active ? ["bg-red", "text-white"] : ["text-red"];
  icon.props.size = "1.5rem";
  icon.props.class = "mr-1 self-center";

  return (
    <a
      href={href}
      class={[
        "inline-flex items-center text-xl font-bold hover:bg-gray hover:text-white p-4",
        ...style,
      ].join(" ")}
    >
      {icon} {name}
    </a>
  );
}

function AuthItem({ loggedIn }: { loggedIn: boolean }) {
  const commonStyle = [
    "rounded-md",
    "mt-2",
    "p-2",
    "inline-flex",
    "items-baseline",
    "self-end",
  ];
  if (loggedIn) {
    return (
      <a
        href="/auth/logout?redirect=/"
        class={["bg-gray", "text-white", ...commonStyle].join(" ")}
      >
        Logout <IconLogout class="ml-1 self-center" />
      </a>
    );
  } else {
    return (
      <a
        href="/auth/login"
        class={["bg-red", "text-white", ...commonStyle].join(" ")}
      >
        <IconLogin class="mr-1 self-center" /> Login
      </a>
    );
  }
}

export default function Header({ session, path }: HeaderProps) {
  return (
    <header class="bg-gray-dark">
      <nav class="container flex">
        <Home active={path == "/"} />
        <div class="flex-grow flex-shrink" />
        <details class="relative group">
          <summary class="flex justify-end">
            <IconMenu
              size="2.5rem"
              class="m-4 bg-red text-white group-open:bg-gray-light group-open:text-white-bright rounded"
            />
          </summary>
          <div class="absolute right-0 flex flex-col border border-black border-t-0 bg-gray-dark drop-shadow-md p-4">
            {menuItems.map((item) => (
              <MenuItem {...item} active={item.href == path} />
            ))}
            <AuthItem loggedIn={session !== undefined} />
          </div>
        </details>
      </nav>
    </header>
  );
}
