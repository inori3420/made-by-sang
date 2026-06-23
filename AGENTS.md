# Made by Sang — Agent Guide

## Next.js version

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js `16.2.9` and React `19.2.4`. APIs, conventions, and file structure may differ from training data.

Before changing Next.js behavior, read the relevant guide in:

```text
node_modules/next/dist/docs/
```

Heed all local deprecation notices. Do not rely on remembered Next.js behavior when the bundled documentation can confirm it.
<!-- END:nextjs-agent-rules -->

## Project overview

This is a design-led portfolio site built with:

- Next.js App Router
- React
- JavaScript and JSX (not TypeScript)
- CSS Modules plus global design tokens
- Tailwind CSS v4 utilities where already useful
- GSAP for interactive and entrance motion
- Locomotive Scroll v5 for site-wide smooth wheel scrolling
- Three.js for the animated hero heading
- `@remixicon/react` for interface icons

The primary experience is a full-viewport hero with a WebGL heading, fixed responsive navigation, status metadata, and live Melbourne time.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
```

For focused validation, lint the files you changed:

```bash
npm run lint -- app/path/to/File.js
```

Run `git diff --check` after edits. Run a production build for changes that affect routing, rendering boundaries, dependencies, or configuration.

## Project structure

```text
app/
  Components/
    Sections/       Page-level sections such as Hero and Heading
    UI/             Reusable interface components
  lib/
    animation.js    Shared GSAP setup and interaction easing
  globals.css       Tailwind import
  styles.css        Fonts and global design tokens
  layout.js         Root layout and persistent Navbar
  page.js           Home page
public/
  fonts/             Local Saans font files
```

Component folders use this pattern:

```text
ComponentName/
  ComponentName.js
  componentName.module.css
```

Keep reusable primitives and composed interface elements in `app/Components/UI/`. Keep page sections in `app/Components/Sections/`.

## React and Next.js conventions

- Components are default-exported functions.
- Use Server Components by default.
- Add `"use client"` only when a component needs state, effects, event handlers, browser APIs, GSAP, or live client-side data.
- Use `next/link` for internal navigation.
- Use `usePathname()` from `next/navigation` for active route state.
- Preserve semantic HTML and accessibility attributes such as `aria-current`, `aria-expanded`, `aria-controls`, and meaningful labels.
- Keep imports relative unless there is a strong reason to use the configured `@/*` alias.
- Do not convert files to TypeScript unless explicitly requested.

The root layout contains:

```jsx
<main data-main>{children}</main>
```

The mobile navigation animation queries `[data-main]` and moves it horizontally. Do not remove or rename this attribute without updating `Navbar.js`.

## Styling conventions

Use CSS Modules for component styling. Use global values from `app/styles.css` instead of introducing duplicate hard-coded values.

Important token groups include:

- Colors: `--bg-*`, `--text-*`, `--brand-*`, `--border-*`
- Spacing: `--space-2xs` through `--space-7xl`
- Typography: `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*`
- Layout: `--page-padding-x`, `--section-padding-y`, `--content-width`
- Motion: `--ease-interaction`

The brand interaction easing is:

```text
cubic-bezier(0.77, 0, 0.175, 1)
```

Use Saans for both body and display typography through:

```css
font-family: var(--font-family-body);
font-family: var(--font-family-display);
```

Do not introduce a different font family without an explicit design request. Available Saans weights are 400, 500, 600, and 700.

The established mobile breakpoint is:

```css
@media (max-width: 47.9375rem) /* 767px */
```

Keep JavaScript media queries synchronized with this breakpoint.

## Animation conventions

Import GSAP and the shared ease from:

```js
import { gsap, interactionEase } from "../../../lib/animation";
```

Follow these rules:

- Use `interactionEase` for branded entrances and interactions.
- Prefer transform and opacity animation over layout properties.
- Use `gsap.context()` with a component ref and revert it during cleanup.
- Kill interruptible tweens before starting replacements.
- Use `overwrite: "auto"` where rapid pointer interactions can overlap.
- Respect `prefers-reduced-motion`.
- Prevent first-frame flashes by setting a safe initial state before paint when necessary.
- Avoid defining the same transform in both CSS and GSAP. Let one system own each animated property.
- Clear GSAP inline properties when CSS must regain control after an animation.

Simple decorative loops, such as the Status indicator and Time separator blink, may use CSS keyframes with a reduced-motion override.

## Existing component behavior

### Navbar

- Fixed three-column desktop layout: Globe, navigation links, contact Button.
- Mobile layout uses an 80vw black underlay menu.
- Opening the menu slides the panel in while shifting `[data-main]` left.
- The menu closes on route changes, overlay clicks, and Escape.
- Body scrolling is locked while the menu is open.
- Keep panel positioning under GSAP control; do not add a competing CSS translate.
- The navigation entrance has an explicit hidden initial state to avoid flashing.

### Button

- Uses a 3-by-8 pixel grid hover reveal.
- The reveal moves from left to right.
- Rapid hover in/out must kill prior tweens cleanly.
- Hover uses inverse background and inverse-primary text.

### Navlink

- Active state is determined by exact pathname equality.
- Hover shape enters left-to-right and exits through the right edge.
- Active and hover text use primary color; inactive text uses the muted token.

### Globe

- CSS wireframe structure with six animated longitude circles.
- Continuously animates and accelerates based on scroll velocity.
- Scroll listeners and reset tweens must be cleaned up.

### Heading

- Renders `MADEBY©SANG` through Three.js and a custom shader.
- The Saans Bold font must finish loading before the canvas texture and reveal animation are created.
- Preserve renderer, texture, event listener, animation frame, and GSAP cleanup.
- Avoid introducing horizontal seams or duplicate transform sources in the shader/canvas reveal.

### Meta, Status, and Time

- `Meta` composes `Status` and `Time` at the bottom of the hero.
- Meta enters from below with GSAP and uses a hidden pre-paint state.
- Status uses `--text-body-sm` and an `--space-xs` blinking brand cube.
- Time defaults to Melbourne (`Australia/Melbourne`), uses a 24-hour `h23` clock, and has a blinking colon.

### About

- The profile information uses `--text-body` for the name and `--text-body-sm` for the role.
- Use `--section-padding-y` for section-level vertical padding; `--page-padding-x` is the horizontal page gutter.
- About passes both copy blocks into the reusable `UI/ScrollText` component.

### ScrollText

- `ScrollText` renders one semantic `<h2>` with visually separated paragraph blocks.
- It splits the visible copy into accessible character spans while retaining unsplit copy for screen readers.
- Each character has a persistent muted base and an inverse-primary foreground mask.
- ScrollTrigger reveals each full-size foreground glyph with a left-to-right `clip-path` mask in reading order; do not use `scaleX`, which distorts the letterforms.
- This text-fill effect remains scroll-driven when `prefers-reduced-motion` is enabled because it does not move layout or content position.
- The component accepts `paragraphs`, `className`, `start`, and `end` props.

### SmoothScroll

- `UI/SmoothScroll` initializes Locomotive Scroll v5 once from the root layout.
- The implementation uses Locomotive Scroll's Lenis-based v5 API, not legacy v4 container syntax.
- It is disabled when `prefers-reduced-motion` is active.
- Route changes trigger a Locomotive resize without replacing Next.js navigation behavior.
- Locomotive's scroll callback calls `ScrollTrigger.update()`, and route resizes refresh ScrollTrigger measurements.
- The mobile navbar pauses and resumes smooth scrolling with `locomotive-scroll:stop` and `locomotive-scroll:start` window events.
- Fixed or nested independently scrollable overlays should use `data-lenis-prevent`.
- Always destroy the Locomotive instance and remove event listeners during cleanup.

## Responsive and accessibility requirements

- Preserve keyboard focus behavior and visible focus styles.
- Hover interactions must also respond to focus where applicable.
- Decorative visuals should use `aria-hidden="true"`.
- Continuous motion must stop or become static under `prefers-reduced-motion`.
- Mobile menus must expose accurate open/closed ARIA state.
- External links that open new tabs must use `rel="noreferrer"`.

## Assets and dependencies

- Fonts live in `public/fonts/` and are registered in `app/styles.css`.
- Locomotive Scroll styles are imported once from the root layout.
- Use icons from `@remixicon/react` rather than embedding unrelated icon SVGs.
- Do not add a dependency when the existing stack can accomplish the task cleanly.
- If a dependency is added, update both `package.json` and the lockfile and validate the import.

## Editing discipline

- Preserve unrelated user changes; the worktree may already be dirty.
- Do not rewrite working animation systems unless the requested change requires it.
- Keep CSS and GSAP initial states consistent to avoid flashes, clipping, and stale inline styles.
- Check both open and reverse states for interactive timelines.
- Check desktop and mobile behavior after navbar or layout changes.
- Remove unused classes, imports, and obsolete animation state when replacing an implementation.
