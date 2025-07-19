import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUserRound } from "lucide-react";

export function UserAvatar() {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
      <AvatarFallback>
        <CircleUserRound className="text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}
