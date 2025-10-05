# Havyn MVP - Lean Architecture Documentation

## Overview
This document outlines the refactored architecture that achieves maximum clarity and lean separation of concerns for Havyn's three core features: daily check-in, dynamic CTA, and reflection prompts.

## Architecture Principles

### 1. Separation of Concerns
- **Components**: Pure UI, no business logic
- **Hooks**: Business logic and state management
- **Services**: API calls and external integrations
- **Clear boundaries**: Each layer has a single responsibility

### 2. Lean Patterns
- Function-based components with React hooks
- Simple prop passing (no complex context providers)
- Clear, readable API route handlers
- Easy to swap and extend

## Folder Structure

```
src/
├── components/havyn/          # Pure UI components
│   ├── daily-check-in-form.tsx      # Form UI only
│   ├── dynamic-cta.tsx              # CTA display only
│   ├── journal-entries-list.tsx     # List display only
│   └── ...
├── hooks/                     # Business logic hooks
│   ├── use-daily-check-in.ts        # Check-in state & actions
│   ├── use-dynamic-cta.ts           # CTA logic & context
│   └── use-reflection-prompts.ts    # Prompt generation
├── services/                  # Pure functions, no UI
│   ├── daily-check-in.ts            # Firebase operations
│   ├── cta-service.ts               # CTA determination logic
│   └── prompt-service.ts            # Prompt generation & history
├── lib/                       # Utilities & types
└── app/                       # Pages & routing
```

## Core Features Implementation

### 1. Daily Check-In

#### Service Layer (`services/daily-check-in.ts`)
```typescript
// Pure functions for data operations
export async function recordDailyCheckIn(firestore, userId, checkInData)
export async function hasTodayCheckIn(firestore, userId)
export async function getRecentCheckIn(firestore, userId)
```

#### Hook (`hooks/use-daily-check-in.ts`)
```typescript
// Business logic and state management
export function useDailyCheckIn() {
  return {
    isSubmitting: boolean,
    hasCheckedInToday: boolean | null,
    submitCheckIn: (data) => Promise<boolean>,
    checkTodayStatus: () => Promise<void>,
    canCheckIn: boolean,
  }
}
```

#### Component (`components/havyn/daily-check-in-form.tsx`)
```typescript
// Pure UI - receives data and handlers via props
export function DailyCheckInForm({
  initialPrompt,
  isSubmitting,
  onSubmit,
  onCancel,
  disabled,
})
```

### 2. Dynamic CTA (Call-to-Action)

#### Service Layer (`services/cta-service.ts`)
```typescript
// Pure functions for CTA logic
export function getDynamicCTA(userContext): CTAConfig
export function shouldShowCTA(userContext): boolean
export function getEncouragementMessage(userContext): string
```

#### Hook (`hooks/use-dynamic-cta.ts`)
```typescript
// Context building and CTA management
export function useDynamicCTA(entries) {
  return {
    cta: CTAConfig | null,
    encouragement: string,
    isLoading: boolean,
    shouldShow: boolean,
    refreshCTA: () => Promise<void>,
  }
}
```

#### Component (`components/havyn/dynamic-cta.tsx`)
```typescript
// Pure UI with multiple display variants
export function DynamicCTA({
  cta,
  encouragement,
  onAction,
  variant, // "default" | "minimal" | "prominent"
})
```

### 3. Reflection Prompts

#### Service Layer (`services/prompt-service.ts`)
```typescript
// AI integration and prompt logic
export async function generateReflectionPrompt(context): PromptResult
export function getQuickCheckInPrompt(): string
export function shouldGenerateNewPrompt(lastDate, history): boolean
```

#### Hook (`hooks/use-reflection-prompts.ts`)
```typescript
// Prompt state and generation management
export function useReflectionPrompts(recentEntries, lastPromptDate) {
  return {
    currentPrompt: string,
    isGenerating: boolean,
    generateNewPrompt: (context) => Promise<void>,
    getQuickPrompt: () => string,
    clearCurrentPrompt: () => void,
    hasPrompt: boolean,
    shouldRefresh: boolean,
  }
}
```

## Key Improvements

### Before (Issues)
- ❌ Mixed UI and business logic in components
- ❌ Firebase operations scattered throughout UI
- ❌ Tightly coupled components
- ❌ No reusable business logic
- ❌ Difficult to test individual features

### After (Solutions)
- ✅ Pure UI components with clear props interface
- ✅ Centralized business logic in hooks
- ✅ Service layer for all external operations
- ✅ Easy to test each layer independently
- ✅ Simple to extend or swap implementations

## Usage Example

```typescript
// In a page component
function HomePage() {
  // Business logic hooks
  const dailyCheckIn = useDailyCheckIn();
  const dynamicCTA = useDynamicCTA(entries);
  const prompts = useReflectionPrompts(entries, lastPromptDate);

  // UI components receive data and handlers
  return (
    <DynamicCTA
      cta={dynamicCTA.cta}
      onAction={handleCTAAction}
      variant="prominent"
    />
  );
}
```

## Benefits

### For Development
- **Fast Feature Development**: Clear patterns to follow
- **Easy Debugging**: Logic isolated in hooks
- **Simple Testing**: Each layer testable independently
- **Collaborative**: Clear boundaries for team work

### For UX
- **Consistent Experience**: Centralized CTA logic
- **Contextual Relevance**: Smart prompts based on user state
- **Responsive Feedback**: Clear loading and error states
- **Accessibility**: Proper ARIA labels and keyboard navigation

### For Maintenance
- **Easy Updates**: Change logic without touching UI
- **Swappable Services**: Replace Firebase with different backend
- **Clear Dependencies**: Explicit prop interfaces
- **Self-Documenting**: Function names describe purpose

## Mobile-First Design

All components are built mobile-first with:
- Touch-friendly tap targets (44px minimum)
- Readable typography and spacing
- Quick access patterns
- Distraction-free layouts
- Keyboard navigation support

## Next Steps

1. Replace current `page.tsx` with `page-refactored.tsx`
2. Update imports throughout the app
3. Add unit tests for each service function
4. Add integration tests for hooks
5. Consider adding error boundaries for better UX
