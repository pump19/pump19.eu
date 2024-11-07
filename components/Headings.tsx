import { ComponentChildren, JSX } from "preact";

interface HeadingProps {
  children: ComponentChildren;
  icon?: JSX.Element;
}

const commonStyle = "text-white font-bold my-2 flex items-baseline";
const iconStyle = "mr-2 self-center";

export function H1({ children, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2.5rem";
    icon.props.class = iconStyle;
  }
  return (
    <h1 class={`${commonStyle} text-3xl`}>
      {icon}
      {children}
    </h1>
  );
}

export function H2({ children, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2rem";
    icon.props.class = iconStyle;
  }
  return (
    <h2 class={`${commonStyle} text-2xl`}>
      {icon}
      {children}
    </h2>
  );
}
