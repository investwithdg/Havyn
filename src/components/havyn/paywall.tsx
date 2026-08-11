"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Brain,
  TrendingUp,
  Shield,
  FileText,
  MessageCircle,
} from "lucide-react";
import type { PremiumFeature } from "@/services/subscription-service";

const FEATURE_DISPLAY: Record<
  PremiumFeature,
  { title: string; description: string }
> = {
  unlimited_ai_prompts: {
    title: "Unlimited AI Prompts",
    description:
      "Get personalized reflection prompts every time you journal — no daily limits.",
  },
  ai_coaching_chat: {
    title: "AI Coaching Chat",
    description:
      "Have deeper conversations with Havyn for personalized wellness guidance.",
  },
  pain_trend_insights: {
    title: "Pain & Mood Trends",
    description:
      "See how your mood and pain levels change over time with detailed charts.",
  },
  export_journal: {
    title: "Journal Export",
    description: "Export your journal entries as PDF for sharing or archiving.",
  },
  advanced_analysis: {
    title: "Deep Analysis",
    description:
      "Get actionable recommendations and pattern detection across your entries.",
  },
};

const BENEFITS = [
  { icon: MessageCircle, label: "Unlimited AI coaching" },
  { icon: Brain, label: "Deep wellness insights" },
  { icon: TrendingUp, label: "Pain & mood trend analytics" },
  { icon: FileText, label: "Journal export" },
  { icon: Shield, label: "Actionable recommendations" },
];

interface PaywallProps {
  feature: PremiumFeature | null;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

export function Paywall({ feature, isOpen, onClose, onSubscribe }: PaywallProps) {
  const display = feature ? FEATURE_DISPLAY[feature] : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85dvh] rounded-t-3xl overflow-y-auto"
      >
        <SheetHeader className="pt-4 pb-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-[#E09D00]/15 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#E09D00]" />
            </div>
          </div>
          <SheetTitle className="text-xl text-center">
            Unlock {display?.title ?? "Premium"}
          </SheetTitle>
          <SheetDescription className="text-center">
            {display?.description ??
              "Get the full Havyn experience with premium features."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Benefits List */}
          <div className="space-y-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pricing */}
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-[#E09D00]/15 text-[#E09D00] border-[#E09D00]/30"
            >
              7-day free trial
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 px-2">
            <Button
              onClick={onSubscribe}
              className="w-full h-12 text-base font-semibold bg-[#E09D00] hover:bg-[#E09D00]/90 text-white rounded-2xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            </SheetClose>
          </div>
        </div>

        <SheetFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Cancel anytime. No charge during your 7-day trial.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
