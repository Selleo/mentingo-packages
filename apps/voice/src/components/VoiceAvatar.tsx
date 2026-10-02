import { cn } from "../lib/utils";

import { MentorMark } from "./MentorMark";

type VoiceAvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function LearnerAvatar({ name, imageUrl, className }: VoiceAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-label={name}
      role="img"
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-900",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function MentorAvatar({ name, imageUrl, className }: VoiceAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-primary-100 ring-1 ring-primary-200/70",
        className,
      )}
    >
      <MentorMark className="size-6 p-0.5 text-primary-700" role="img" aria-label={name} />
    </div>
  );
}
