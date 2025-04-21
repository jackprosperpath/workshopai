
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type User = {
  id: string;
  name: string;
};

type ActiveUsersAvatarsProps = {
  activeUsers: User[];
};

export default function ActiveUsersAvatars({ activeUsers }: ActiveUsersAvatarsProps) {
  if (activeUsers.length === 0) return null;
  return (
    <div className="flex -space-x-2 mr-2">
      {activeUsers.slice(0, 3).map((user) => (
        <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
          <AvatarFallback className="text-xs">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
      {activeUsers.length > 3 && (
        <Avatar className="h-6 w-6 border-2 border-background">
          <AvatarFallback className="text-xs">+{activeUsers.length - 3}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
