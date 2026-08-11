import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.havyn.app',
  appName: 'Havyn',
  webDir: 'public',
  server: {
    // Points the native shell at the live Next.js server rather than a bundled
    // static build — required because Genkit AI flows, Stripe API routes, and
    // Firebase Admin all need a running Node server (see docs/postpartum-companion-roadmap.md
    // discussion in the CTO session notes). Swap to the deployed Firebase App
    // Hosting URL once the Firebase project's API key issue is fixed.
    url: 'http://10.0.0.111:9002',
    cleartext: true,
  },
};

export default config;
