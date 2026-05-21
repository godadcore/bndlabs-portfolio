import { HugeiconsIcon } from "@hugeicons/react";

export default function HugeIcon({
  icon,
  size = 18,
  strokeWidth = 1.8,
  className,
  ...props
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}
