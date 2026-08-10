"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Crown, LogOut, CreditCard, Mail } from "lucide-react";
import type { UseSubscriptionReturn } from "@/hooks/use-subscription";
import type { PremiumFeature } from "@/services/subscription-service";

interface SettingsScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { email?: string | null; displayName?: string | null; metadata?: { creationTime?: string } };
  subscription: UseSubscriptionReturn;
  onSignOut: () => void;
  onManageSubscription: () => void;
  triggerPaywall: (feature: PremiumFeature) => void;
}

export function SettingsScreen({
  open,
  onOpenChange,
  user,
  subscription,
  onSignOut,
  onManageSubscription,
  triggerPaywall,
}: SettingsScreenProps) {
  const memberSince = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md" data-scrollable="true">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Plan Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm">Current Plan</span>
                <Badge
                  variant={subscription.isPremium ? "default" : "secondary"}
                  className={
                    subscription.isPremium
                      ? "bg-[#E09D00] text-white"
                      : ""
                  }
                >
                  {subscription.isPremium ? "Premium" : "Free"}
                </Badge>
              </div>

              {subscription.isPremium && subscription.subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Next billing date
                  </span>
                  <span className="text-sm">
                    {subscription.subscription.currentPeriodEnd.toLocaleDateString()}
                  </span>
                </div>
              )}

              {subscription.isPremium ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onManageSubscription}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="w-full bg-[#E09D00] hover:bg-[#E09D00]/90 text-white"
                  onClick={() => triggerPaywall("unlimited_ai_prompts")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.displayName && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm">{user.displayName}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="ml-4 min-w-0 truncate text-sm">{user.email}</span>
                </div>
              )}
              {memberSince && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Member since
                  </span>
                  <span className="text-sm">{memberSince}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Sign Out */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
