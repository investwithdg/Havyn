import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-journal-prompt.ts';
import '@/ai/flows/analyze-journal-entry.ts';