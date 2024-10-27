import { JSX } from "preact";

interface HeadingProps {
  content: string;
  icon?: JSX.Element;
}

const commonStyle = "text-white font-bold my-2 flex items-baseline";
const iconStyle = "mr-2 self-center";

export function H1({ content, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2.5rem";
    icon.props.class = iconStyle;
  }
  return (
    <h1 class={`${commonStyle} text-3xl`}>
      {icon}
      {content}
    </h1>
  );
}

export function H2({ content, icon }: HeadingProps) {
  if (icon) {
    icon.props.size = "2rem";
    icon.props.class = iconStyle;
  }
  return (
    <h2 class={`${commonStyle} text-2xl`}>
      {icon}
      {content}
    </h2>
  );
}
