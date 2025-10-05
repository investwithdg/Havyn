/**
 * Dynamic CTA Component
 * Pure UI component - displays contextually relevant call-to-action
 * No business logic - receives all data via props
 */

"use client";

import { Sparkles, BookHeart, TrendingUp, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CTAConfig } from "@/services/cta-service";

const actionIcons = {
  start_journal: <Sparkles className="w-5 h-5" />,
  continue_journal: <BookHeart className="w-5 h-5" />,
  view_insights: <TrendingUp className="w-5 h-5" />,
  set_goal: <Target className="w-5 h-5" />,
};

export interface DynamicCTAProps {
  // Data
  cta: CTAConfig | null;
  encouragement?: string;
  isLoading?: boolean;
  
  // Handlers
  onAction: (action: CTAConfig['action']) => void;
  
  // UI Options
  variant?: "default" | "minimal" | "prominent";
  showEncouragement?: boolean;
}

export function DynamicCTA({
  cta,
  encouragement,
  isLoading = false,
  onAction,
  variant = "default",
  showEncouragement = true,
}: DynamicCTAProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!cta) {
    return null;
  }

  const handleClick = () => {
    onAction(cta.action);
  };

  if (variant === "minimal") {
    return (
      <Button onClick={handleClick} variant="ghost" className="w-full">
        {actionIcons[cta.action]}
        <span className="ml-2">{cta.text}</span>
      </Button>
    );
  }

  if (variant === "prominent") {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
            <div className="text-primary text-xl">
              {actionIcons[cta.action]}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1">{cta.text}</h3>
            <p className="text-sm text-muted-foreground">{cta.context}</p>
          </div>

          {showEncouragement && encouragement && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground italic">
                {encouragement}
              </p>
            </div>
          )}

          <Button onClick={handleClick} className="w-full" size="lg">
            {actionIcons[cta.action]}
            <span className="ml-2">{cta.text}</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className="text-center space-y-4 p-6">
      <div>
        <h2 className="text-xl font-headline text-primary mb-2">{cta.text}</h2>
        <p className="text-muted-foreground text-sm">{cta.context}</p>
      </div>

      {showEncouragement && encouragement && (
        <Badge variant="secondary" className="text-xs px-3 py-1">
          {encouragement}
        </Badge>
      )}

      <Button onClick={handleClick} size="lg" className="min-w-[200px]">
        {actionIcons[cta.action]}
        <span className="ml-2">{cta.text}</span>
      </Button>
    </div>
  );
}
