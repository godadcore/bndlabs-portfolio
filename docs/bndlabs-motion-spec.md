# Bndlabs reference notes and motion spec

Inspected https://oliviae.work/ in the browser on 19 Nov 2026. The welcome prompt, skip control, homepage, and menu were used directly. Work, About, and Journal later returned an empty document in the embedded browser, so those three pages were read from the live HTML after the visual session failed. Nothing below is copied from that site.

## What the reference does well

- A short welcome can be skipped. It does not block the portfolio.
- The homepage is one composed screen: a compact introduction, one dominant visual, and a few physical cards.
- Type stays readable. The page does not rely on a giant headline.
- Navigation is a short menu: Home, Work, About, Journal, plus a reduce-motion control.
- The background is a quiet printed texture. Objects sit on it with soft shadow, not glow.
- Work is a gallery with briefs and results. About is a biography and timeline. Journal is a separate editorial volume.

## What Bndlabs will not repeat

Letter tiles, sticker-cut portraits, a music player, mood names, handwritten script, pink surfaces, and the reference’s wording stay there. Bndlabs has six practices, so the homepage introduces a department index instead of three doors.

## Original system

- Brand: existing wordmark, `#9566EA` to `#6337C2`, accent `#5f50d6`. Square geometry.
- Surface: fine paper grain plus a hairline technical grid. Density changes by section.
- Type: Playfair Display for the name only, capped near 48px. System sans for body and labels.
- Motion: a constructed geometric mark. Separate planes rotate and shift with the pointer, then settle. The motion shows a studio assembled from parts. It is not decoration floating in the background.
- Welcome: one skippable studio note per session. No name capture.
- Reduced motion: the mark is a still arrangement of planes. No auto-rotation.
- Packages: Motion and React Three Fiber already cover this. GSAP, Lenis, and extra animation libraries are not needed for the homepage.

## Homepage structure

1. Skippable welcome.
2. Name, role, introduction, and actions: View work, About, Contact.
3. The geometric mark.
4. Six department entries.
5. Featured case studies from Sanity.
6. Latest journal posts from Sanity.
