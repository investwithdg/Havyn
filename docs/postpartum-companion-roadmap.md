# Havyn Postpartum Companion MVP Roadmap

## Product North Star

Havyn should become an AI-powered postpartum companion for the first 12 weeks after birth. The MVP should prove that a new mother returns daily because Havyn helps her feel seen, track what is changing, and know when to ask for support.

The current repo is a useful Firebase/Next.js seed, but the product is still closer to general wellness journaling. The next phase should narrow the product around postpartum recovery, emotional support, and safety-aware guidance.

## Current State

What already exists:

- Mobile-first Next.js/Firebase app shell
- Firebase auth and Firestore-backed journal entries
- Mood and pain check-ins
- Journal entry capture
- AI prompt generation and journal analysis via Genkit
- Calendar/history surfaces
- Escalation screen with crisis resources
- Subscription/paywall and Stripe infrastructure

Main gap:

The current data model and screens do not yet capture postpartum context. Mood, pain, and freeform journaling are not enough to deliver the promised postpartum companion experience.

## MVP Wedge

The first marketable product should not attempt to cover all of women's wellness. The wedge is:

> A daily AI companion for postpartum mothers that tracks emotional, physical, and support signals, reflects patterns back with compassion, and routes to help when risk rises.

## Gate 1: Postpartum MVP

Build this before expanding into clinics, products, education, or broader women's wellness.

### 1. Postpartum Profile

Capture once during onboarding and allow later edits:

- Baby birth date or postpartum week
- Delivery type: vaginal, C-section, VBAC, assisted, loss/other
- Feeding mode: breastfeeding, pumping, formula, combo, not applicable
- Sleep baseline
- Support system: partner, family, doula, clinician, limited support
- Current care team and preferred emergency contact
- Known history: depression, anxiety, bipolar disorder, birth trauma, pregnancy complications
- Consent and boundaries for AI support, reminders, and shared reports

### 2. Daily Postpartum Check-In

Replace the generic check-in with postpartum-specific signals:

- Mood
- Anxiety
- Overwhelm
- Sleep quantity and quality
- Pain level and recovery discomfort
- Bleeding/recovery concern
- Feeding stress
- Intrusive thoughts
- Bonding/connection today
- Support received today
- Safety question: "Do you feel at risk of hurting yourself or someone else?"
- Optional journal note

### 3. AI Companion Response

After check-in, generate a short companion response:

- Validate what the user shared
- Name one pattern or signal without diagnosing
- Offer one next step for the next hour or day
- Encourage reaching out when the entry suggests support is needed
- Avoid medical diagnosis, treatment instructions, or false certainty

### 4. Risk-Aware Escalation

Escalation should be rule-based first, not AI-only.

Immediate escalation triggers:

- Self-harm or harm-to-others signal
- Psychosis-like language or loss of reality testing
- Severe distress with no support
- Repeated high-risk pattern over multiple days

Escalation actions:

- Show emergency/crisis resources immediately
- Encourage contacting OB, midwife, therapist, doula, or emergency contact
- Allow generating a shareable status summary
- Keep crisis resources visible and never paywalled

Clinical grounding:

- ACOG recommends depression and anxiety screening during postpartum care using standardized, validated instruments.
- ACOG recommends immediate assessment and risk-tailored management when self-harm or suicide risk is endorsed.
- ACOG frames postpartum care as ongoing, with early contact within 3 weeks and comprehensive care no later than 12 weeks after birth.

### 5. Weekly Insight Report

Produce a simple weekly report for the user and optionally for a partner, doula, therapist, OB, or pediatrician:

- Mood trend
- Anxiety/overwhelm trend
- Sleep trend
- Pain/recovery trend
- Feeding stress trend
- Support pattern
- Journal themes
- Risk flags, if any
- Suggested questions for the next appointment

## Gate 2: Trusted Companion

After Gate 1 is usable, build retention and trust.

- Week-by-week postpartum journey content for weeks 1-12
- Reminder cadence based on baby age and user preference
- "Ask Havyn" chat with guardrails and citations/limits where appropriate
- Partner/support-person summaries
- EPDS/PHQ-9/GAD-7-style screening support, with explicit non-diagnostic framing
- Clinician/doula export flow
- Better empty states and recovery milestones

## Gate 3: Care Network Layer

Only build this after daily use and retention are proven.

- Coach/doula dashboard
- Provider referral workflows
- Paid support plans
- Group programs or cohorts
- Clinic/wellness center integration
- Employer or payer partnerships
- De-identified insights/reporting with explicit consent

## Near-Term Build Sequence

1. Extend `src/lib/types.ts` with postpartum profile and postpartum check-in types.
2. Replace `CheckInScreen` with a postpartum daily check-in flow.
3. Update `daily-check-in` service to persist postpartum signals.
4. Rewrite Genkit prompt and analysis flows around postpartum companion behavior.
5. Add deterministic risk flagging before AI response generation.
6. Update `EscalateScreen` for postpartum-specific support and crisis routing.
7. Add a weekly report component using recent entries.
8. Update home screen copy and navigation around the 12-week companion journey.
9. Add tests for risk flagging and report generation logic.
10. Validate the mobile experience as PWA/mobile web before considering native rebuild.

## Success Criteria

The MVP is ready for pilot when a tester can:

- Create/sign in to an account
- Complete postpartum onboarding
- Complete a daily postpartum check-in in under 90 seconds
- Receive a useful AI companion response
- See a 7-day pattern summary
- Trigger safe escalation when high-risk inputs are entered
- Export or share a readable status report
- Use the app comfortably on a phone-sized viewport

## Decision

Stay on the current Next.js/Firebase app for the MVP. Move to Expo/React Native only after the postpartum loop proves daily retention and the core data model stabilizes.
