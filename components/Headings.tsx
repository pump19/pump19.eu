import { ComponentChildren, JSX } from "preact";

interface HeadingProps {
  children: ComponentChildren;
  icon?: JSX.Element;
}

const commonStyle = [
  "text-white",
  "font-bold",
  "my-2",
  "flex",
  "items-baseline",
];
const iconStyle = ["mr-2", "self-center"];

export function H1({ children, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2.5rem";
    icon.props.class = iconStyle.join(" ");
  }
  return (
    <h1 class={["text-3xl", ...commonStyle].join(" ")}>
      {icon}
      {children}
    </h1>
  );
}

export function H2({ children, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2rem";
    icon.props.class = iconStyle.join(" ");
  }
  return (
    <h2 class={["text-2xl", ...commonStyle].join(" ")}>
      {icon}
      {children}
    </h2>
  );
}
