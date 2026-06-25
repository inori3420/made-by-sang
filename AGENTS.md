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
`TransitionProviders` owns this `<main data-main data-page-transition>` wrapper so page transitions and mobile nav target the same page layer. Keep persistent UI such as `SmoothScroll`, `Navbar`, and `SpeedInsights` outside that animated page layer.

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
- Navbar theming is scroll-aware rather than blend-mode based.
- Navbar automatically inspects every `[data-main] section` and treats sections whose computed background matches `--bg-inverse` as inverse sections.
- `data-navbar-theme="inverse"` or `data-navbar-theme="default"` may be used to override automatic background detection.
- ScrollTrigger switches the Globe and desktop Navlinks to inverse tokens while the navbar overlaps an inverse section.
- Page-level section components must render a semantic `<section>` if they should participate in automatic navbar theme detection.
- Mobile layout uses an 80vw black underlay menu.
- Opening the menu slides the panel in while shifting `[data-main]` left.
- The menu closes on route changes, overlay clicks, and Escape.
- Body scrolling is locked while the menu is open.
- Keep panel positioning under GSAP control; do not add a competing CSS translate.
- The navigation entrance has an explicit hidden initial state to avoid flashing.

### Button

- Default buttons show a trailing arrow icon.
- Hover/focus collapses the trailing icon and expands the leading icon, shifting the label to the right.
- Disabled buttons use `--bg-muted` surfaces and `--text-primary` content at `0.3` opacity. Disabled link-style buttons render as non-link elements, do not navigate, and may reveal the `disabledLabel` text, defaulting to “Available Soon”, on hover.
- Rapid hover in/out must kill prior timelines cleanly.
- Keep the Button's outer footprint fixed; animate icon scale and label translation only. Do not animate icon width or margins, which causes hover hitbox feedback and layout jumping.
- Use `LeadingIcon` and `TrailingIcon` when the two Button states need different Remix icons.
- Use the controlled `active` prop to hold the Button in its hover-style state, and `activeLabel` when the revealed duplicate label differs from the default label. The mobile Navbar toggle uses this for its Menu/Close transition.

### Navlink

- Active state is determined by exact pathname equality.
- Hover shape enters left-to-right and exits through the right edge.
- Navlinks consume `--navbar-foreground` and `--navbar-muted` from Navbar so their colors follow the current section theme.
- Hover and focus text always use `--text-primary`, including over inverse sections, to contrast with the brand hover shape.

### Globe

- CSS wireframe structure with six animated longitude circles.
- Continuously animates and accelerates based on scroll velocity.
- Scroll listeners and reset tweens must be cleaned up.
- Inherits the Navbar logo color so it follows the current section theme.

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

### How

- The How section is a full-viewport inverse canvas with its heading centered in the section and supporting copy centered near the bottom.
- The How section uses a `350svh` scroll area with one sticky `100svh` stage. Because a sticky `100svh` child inside a `350svh` parent has `250svh` of actual sticky scroll, heading/content animation finishes across the first `200svh` of sticky scroll and the grid transition runs across the final `50svh` while the same stage remains sticky; keep the grid transition ending at sticky release so it does not create a dead white viewport before Works.
- On tablet and mobile (`max-width: 63.9375rem`), shorten How to `300svh`: heading/content should finish at `window.innerHeight * 1.7`, and the grid transition should run from `1.7` to `2.0` viewport heights so Works arrives without a long blank transition gap.
- The heading uses a `div` with `role="heading"` and `aria-level="2"` so each phrase can be stacked absolutely while preserving heading semantics.
- The How heading uses `mix-blend-mode: difference` so it visually inverts against the `imgGroup` layer underneath; do not use `background-blend-mode` for this.
- Split every heading phrase into SplitText chars after fonts are ready; each heading reveals in from the right with scrubbed `0.05` char stagger in normal reading order (`from: "start"`), so the motion travels right-to-left without reversing character order.
- Build the heading swap timeline from the actual `[data-how-heading-phrase]` spans and their SplitText char arrays instead of hard-coding first/second/third phrase variables, so heading copy can be changed safely.
- Keep one scrubbed ScrollTrigger timeline for heading reveal, swaps, and the final content slide-up, ending at `window.innerHeight * 2` so the final sticky beat is reserved for the grid transition.
- Start the How ScrollTrigger at `top 30%` so the scrubbed stage timeline begins after the section has entered the viewport while still leaving the final sticky beat for the grid transition.
- `imgGroup` is the How image-frame container; keep it centered in the same absolute stack as the heading, below the heading by z-index, at a `3 / 2` aspect ratio, and reveal it in the scrub timeline after the first heading finishes entering. The reveal must expand from the exact center using a collapsed center `polygon()` clip-path while rotating from `-45deg` to `0deg`, not a bottom/edge-feeling inset wipe.
- Until Prismic imagery is added, `imgGroup` contains five absolutely stacked local placeholder images from `public/images/how/` that swap instantly once per second in an infinite CSS `steps(1, end)` loop, with a reduced-motion fallback that keeps the first image visible.
- Heading chars should travel by viewport distance (`100vw` / `-100vw`) during swaps instead of per-character `xPercent`, so long headings fully clear before the next phrase enters.
- After the stage reaches the top, the heading timeline swaps phrases horizontally using each phrase's SplitText chars: current phrase chars exit left first, then the next phrase chars enter from the right to avoid overlap.
- Keep heading phrase parent spans responsible only for absolute centering; do not animate parent opacity during swaps, because both in and out movement should scrub at the char level.
- The supporting paragraph waits for fonts, then uses SplitText line masks and slides upward only after the final heading has revealed; the final heading should remain visible instead of fading out.
- Keep the paragraph hidden with `gsap.set()` until SplitText has established every line's masked starting position to prevent a pre-animation flash.

### Works

- The Works section is a semantic `section` with `min-height: 100svh` and a featured case-study layout.
- Keep the desktop composition close to the current reference: left “Recent works” kicker plus project count and CTA, center dominant project image, and right project title/copy/metric.
- Works no longer uses the muted “And More” footer label. On desktop, place the disabled “View all works” CTA at the bottom of the left index/count column. On tablet, place that CTA to the right of the project counter. On mobile, keep only the bottom CTA row and hide the index-column CTA.
- Works uses a sticky `.stage` inside a taller scroll area so the featured project frame can remain pinned while all project images scroll through.
- The full Works stage must fit inside `100svh`; on desktop/tablet, the removed footer space belongs to the media area, so keep the media sized from the stage height budget instead of reserving a footer row.
- The project image area uses `UI/DissolveImageStack` in contained mode (`pin={false}`) with the Works section as the ScrollTrigger source.
- Each Works project segment uses a hold-then-transition rhythm: hold the current project for the first `70vh` of a `100vh` segment, then run the dissolve/image transition during the final `30vh`.
- The project count is tied to the image's visual completion point, not the very end of the dissolve grid tail: it stays on the current project during the hold and transition, then slides to the next number once the next image is fully revealed; `/total` remains static.
- The project title, description, metric, and metric caption are stacked panels that update with the completed project index. Titles/metric badges use masked slide replacement; description and metric caption use SplitText line masks with `0.1` stagger.
- Hovering or focusing the Works image area fades in a `30%` black media overlay and reveals a centered `3:2` project showcase preview that slides up from inside the media frame with a `rotateX` reveal from `60deg` to `0deg`. Disable and force-hide this showcase during the active dissolve/image transition window; it should only open while a project image is settled. Keep the preview synced to the completed project index and let GSAP own its transform so it can later be replaced with Prismic video/media content.
- The Works media frame renders transparent active project links over the image. Only the current completed project link should receive pointer events and keyboard focus; future Prismic data can replace the placeholder `/works/{slug}` hrefs.

### GridTransition

- `UI/GridTransition` renders an absolutely positioned pixel grid overlay whose cells scrub from opacity `0` to `1` with ScrollTrigger.
- Keep it flexible through props for `color`, `columns`, `rows`, `start`, `end`, `scrub`, `trigger`, `direction`, and `className`; color should flow through the `--grid-transition-color` CSS variable.
- Use the optional `navbarTheme` prop when a grid overlay visually changes the background under the fixed navbar; it dispatches a scoped navbar theme override only after the grid ScrollTrigger reaches completion, not while the reveal is still in progress.
- The default `direction="random"` reveal is bottom-biased random: lower rows reveal first, with randomized cell order inside each row so it still reads as pixels rather than a clean band. Use `direction="fully-random"` only when the older everywhere-scattered behavior is desired; `direction="bottom-to-top"` and `direction="top-to-bottom"` remain available for deterministic wipes.
- Because the component is absolutely positioned, mount it inside a positioned parent with real height. In How, render it inside `.stage` above all stage content and use the How section as its trigger, starting at `window.innerHeight * 2` and ending at `window.innerHeight * 2.5`, which is the final shortened sticky scroll beat of the `350svh` section; pass `navbarTheme="default"` because the white grid covers the inverse background.
- For How on tablet/mobile, use the responsive GridTransition timing helpers instead of the desktop `2 → 2.5` viewport range; the compact range is `1.7 → 2.0` viewport heights to prevent excess white scroll before Works.
- The component is decorative and must stay `aria-hidden`, pointer-events disabled, and scoped with `gsap.context()` cleanup.

### DissolveImageStack

- `UI/DissolveImageStack` is a reusable pinned image-stack transition based on the experimental `Sections/Test` script.
- Keep all DOM access inside client effects; do not use `window` or `document` at module scope.
- The component measures its own viewport-sized root, renders deterministic character cells, and uses one scoped ScrollTrigger to scrub image clip-path transitions plus the dissolve grid.
- It can be used standalone as a pinned full-viewport section or as a contained media block by passing `as`, `pin={false}`, `trigger`, `start`, `end`, `height`, and `minHeight`.
- `segmentHoldRatio` delays each image transition inside its scroll segment; for Works, use `0.7` so each project holds before the dissolve begins.
- Clean up with `gsap.context().revert()` and avoid loose global selectors so the component can be mounted for review without leaking ScrollTriggers.

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
- On a hard page refresh/load, browser scroll restoration is set to manual and the window is reset to the top before Locomotive Scroll starts.
- Fixed or nested independently scrollable overlays should use `data-lenis-prevent`.
- Always destroy the Locomotive instance and remove event listeners during cleanup.

### Page transitions

- `Components/Providers/TransitionProviders` uses `next-transition-router` with `auto` link detection and GSAP callbacks.
- Only animate `[data-page-transition]`, not persistent layout UI.
- Keep the transition basic and reliable: leave fades/slides `[data-page-transition]` upward, enter fades/slides it in from below.
- `TransitionProviders` owns the `<main data-main data-page-transition>` wrapper; keep persistent UI outside it in `layout.js`.
- Keep `leave` and `enter` as stable callbacks, target the page through a ref, and return tween cleanup to avoid listener churn or leaked tweens.
- Respect `prefers-reduced-motion` by skipping the transform transition.

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
