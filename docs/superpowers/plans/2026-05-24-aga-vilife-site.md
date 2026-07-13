# aga-vilife Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese-first, mobile-first `aga-vilife` fengshui service website with two placeholder calculator experiences.

**Architecture:** Create a Vite React app in the empty workspace. Keep calculator behavior in small pure functions and render the page with one focused app component plus responsive CSS.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, CSS.

---

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`: app mount and font preconnects.
- `src/main.tsx`: React entrypoint.
- `src/App.tsx`: page UI, form state, and interactions.
- `src/calculators.ts`: pure validation/result helpers for phone and birthday placeholder readings.
- `src/content.ts`: Chinese-first page content and service data.
- `src/App.css`: mobile-first Calm Modern design system and responsive layout.
- `src/calculators.test.ts`: unit tests for calculator validation and placeholder result behavior.
- `src/test/setup.ts`: Testing Library test setup.
- `vite.config.ts`: Vite React and Vitest config.
- `tsconfig.json`, `tsconfig.node.json`: TypeScript config.

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/main.tsx`

- [ ] **Step 1: Add Vite React project files**

Create the listed files with React, TypeScript, Vitest, and Testing Library configured.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: dependencies install and `package-lock.json` is created.

### Task 2: Calculator Helpers With TDD

**Files:**
- Create: `src/calculators.test.ts`
- Create: `src/calculators.ts`

- [ ] **Step 1: Write failing tests**

Tests cover empty phone validation, phone placeholder reading, empty birthday validation, and birthday placeholder reading.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run`
Expected: FAIL because `src/calculators.ts` does not exist yet.

- [ ] **Step 3: Implement helpers**

Add `getPhoneReading` and `getBirthdayReading` pure functions that validate input and return Chinese placeholder reading objects.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- --run`
Expected: PASS.

### Task 3: Page Content And UI

**Files:**
- Create: `src/content.ts`
- Create: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Add Chinese-first content**

Define hero copy, service cards, consultation offerings, and CTA labels.

- [ ] **Step 2: Build React UI**

Render the hero, service explanation, two calculator forms, consultation offerings, and contact CTA. Wire forms to the calculator helpers.

- [ ] **Step 3: Add Calm Modern styling**

Implement mobile-first CSS with ivory, ink green, jade, muted gold, restrained red, elegant Chinese typography, stable controls, and responsive desktop layout.

### Task 4: Verification

**Files:**
- Modify as needed based on verification.

- [ ] **Step 1: Run tests**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Run dev server**

Run: `npm run dev -- --host 127.0.0.1`
Expected: local URL is available.

- [ ] **Step 4: Browser verification**

Open the local URL, check desktop and mobile, submit both calculators, and fix any layout or interaction issues.
