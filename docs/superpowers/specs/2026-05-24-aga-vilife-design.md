# aga-vilife Design Spec

## Goal

Build `aga-vilife` as a Chinese-first, mobile-first fengshui service website. The site should not require registration. It should immediately show the service, establish a calm premium feeling, and expose two core tools:

- 手机号码测算
- 生日命理分析

The real calculation formulas are intentionally out of scope for this phase. The calculators should collect input and show polished placeholder guidance that can later be replaced by the user's actual fengshui rules.

## Visual Direction

Use the selected Calm Modern direction:

- Warm refined palette with ivory, ink green, jade, muted gold, and a restrained accent red.
- Chinese-first copy, with English used only as light supporting brand texture where helpful.
- Elegant display typography for the brand and hero. Body text should remain highly readable on mobile.
- Mobile-first layout with a dense, useful first screen rather than a marketing-only landing page.
- No registration, login, or gated flow.

## Page Structure

The first screen should show:

- Brand name: `aga-vilife`
- Chinese headline describing fengshui clarity for numbers and birth energy.
- Short service promise.
- Two primary actions: 手机号码测算 and 生日命理分析.
- A visual signal of fengshui, balance, and five-element inspired guidance.

Below the first screen:

- Service explanation section.
- Two interactive calculator panels.
- Service offering section for deeper consultation.
- Simple contact CTA.

## Calculator Behavior

Phone calculator:

- Accepts a phone number.
- Validates that the user entered digits.
- Shows a placeholder reading preview explaining that the full formula will be connected later.
- Encourages consultation for a deeper reading.

Birthday calculator:

- Accepts a date of birth.
- Validates that a date was selected.
- Shows a placeholder reading preview explaining that the full birth analysis will be connected later.
- Encourages consultation for a deeper reading.

Both tools should be implemented with clean, isolated functions or component state so real formulas can be added without redesigning the UI.

## Technical Shape

Because the workspace is empty, scaffold a small frontend website using the simplest maintainable stack available in the project. Prefer a Vite React app if no existing framework is present.

Expected pieces:

- Main app component for the page.
- Data/config objects for services and calculator placeholder results.
- Responsive CSS with mobile-first breakpoints.
- No backend, authentication, database, or external service dependency.

## Error Handling

Form errors should be calm and inline:

- Empty phone number: ask the user to enter a number.
- Empty birthday: ask the user to select a birthday.

No blocking modals are needed.

## Testing And Verification

Verify by:

- Building the project successfully.
- Running the local dev server.
- Opening the page in the browser.
- Checking mobile and desktop layouts.
- Confirming both calculator panels accept input and show placeholder results.

## Deferred

- Real fengshui phone number formula.
- Real birthday/bazi or element calculation formula.
- Registration, user accounts, saved reports, payments, and admin tools.
