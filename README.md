# Lumora

An adaptive physics exam-prep demo that tracks understanding, not just answers.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm test
npm run build
```

## Demo flow

1. Start the 12-question diagnostic. Select an answer and explain the reasoning.
2. On the acceleration question, try “Acceleration must be positive because the car is moving.” Feedback highlights the exact evidence and corrective explanation.
3. Finish the diagnostic to see mastery per concept, then practice the weakest concept.
4. Open the interactive prerequisite map; select a node to see prerequisites and practice it.
5. Open the review schedule. Mistakes recur after 10 minutes; successful answers recur in 1, 3, or 7 days.
6. Open the teacher dashboard to compare your current profile with seven clearly labeled simulated learners. Export the answer history as JSON.

## Learning model

12 concepts cover secondary-school motion and forces. Mastery starts at 30% as an unassessed prior. Each correct answer adds 14 percentage points; an incorrect answer subtracts 10. A reasoning misconception subtracts a further 8. Scores stay between 5% and 98%. These are transparent demo heuristics, not validated psychometric estimates. Diagnostic asks one question per concept; certainty is limited after one observation.

Practice selects the lowest mastery, with a priority bonus for overdue reviews. Foundation (<40%), developing (40–69%), and challenge (70%+) levels alter scaffolding and reasoning demands; numeric templates produce new parameter variations. This is a calibrated-by-rule question bank, not an empirically calibrated item-response model or unrestricted LLM question generator.

Progress is stored in browser localStorage, with export and reset. The teacher dashboard combines this local learner with seven deterministic simulated profiles; it is not a shared multi-user backend. No authentication is included.

## Optional LLM misconception analysis

The Vercel Node function `api/analyze.js` uses the OpenAI Responses API with a strict JSON schema and evidence-substring validation. Set `OPENAI_API_KEY` in Vercel environment variables (never in frontend variables). Optionally set `OPENAI_MODEL`. With no key or on API failure, feedback explicitly identifies the rule-based demo mode. Student explanations are sent to OpenAI only when this server-side feature is configured; API storage is disabled. The demo rule matcher has limited language coverage and can miss paraphrases or misunderstand negation.

`npm run dev` serves the UI only. Use `npx vercel dev` for local server-function testing, or test the deployed Vercel app. A public LLM-enabled production deployment should add authentication, persistent per-user rate limiting, usage quotas, and a privacy policy before real classroom use.

## Deploy

Import this repository in Vercel. The framework is Vite, build command is `npm run build`, output directory is `dist`. The `api/` directory is deployed as Vercel Functions automatically. No API key is necessary for the deterministic working demo. To deploy with the CLI: `npx vercel login`, then `npx vercel --prod`.

## Stack

React, Vite, Three.js (hero concept sculpture), Cytoscape.js (prerequisite graph), Chart.js (class mastery), Framer Motion (page entrance), Lucide icons. Responsive layout, keyboard-operable controls, reduced-motion support.
