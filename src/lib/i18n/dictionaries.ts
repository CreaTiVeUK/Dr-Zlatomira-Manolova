// Re-export from split files. Import directly from en.ts or bg.ts for
// tree-shaking / lazy loading in new code.
export type { Dictionary } from "./en";
export { en } from "./en";
export { bg } from "./bg";
