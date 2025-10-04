import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUserRound } from "lucide-react";
import type { User } from "firebase/auth";

export function UserAvatar({ user }: { user: User | null }) {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User Avatar"} data-ai-hint="user avatar" />
      <AvatarFallback>
        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <CircleUserRound className="text-muted-foreground" />}
      </AvatarFallback>
    </Avatar>
  );
}
