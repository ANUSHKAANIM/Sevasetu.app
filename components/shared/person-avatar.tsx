import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { colorForId, initialsFor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

export function PersonAvatar({
  id,
  name,
  size = "md",
  className,
}: {
  id: string;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      <AvatarFallback
        className="font-serif font-semibold text-white"
        style={{ backgroundColor: colorForId(id) }}
      >
        {initialsFor(name)}
      </AvatarFallback>
    </Avatar>
  );
}
