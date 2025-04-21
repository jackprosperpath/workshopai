import React from "react";
import { useTeamInvites } from "@/hooks/team/useTeamInvites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DraftLimitWrapperProps {
  children: React.ReactNode;
  draftsCount: number;
  onNavigateToTeam: () => void;
}

// Draft limit is now always unlocked, just pass through children.
export function DraftLimitWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
