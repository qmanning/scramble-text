# Scramble / Unscramble Text

Text that resolves out of glyph noise, holds, and scrambles again — and you can edit it in place.

**Live demo:** https://qmanning.com/labs/scramble-text

## What it does

A line of text starts as glyph noise and resolves, character by character, into the real words; holds for a beat; then scrambles back and loops. Click it to **edit in place** (up to 150 characters) and hit *Try It* — your text gets the same treatment. It reads as *decoding* rather than *glitching* because characters settle left to right and never re-scramble once resolved.

## How it works

- A `requestAnimationFrame` loop advances a "resolved" cursor; characters before it show the real glyph, characters after it show a random one from a small glyph set, re-rolled every few frames so the noise shimmers.
- Spaces are never scrambled, so word shapes stay readable during the resolve.
- The loop has three phases — resolve → hold → scramble — with timings at the top of the file.
- Editing swaps the display for an `<input>` with the same font metrics, so nothing jumps.

## Settings

The gear in the top corner of the demo (14px, `Settings` icon) opens a menu of this lab's controls; every change updates the demo live. Save keeps your values in the browser, Reset restores the defaults, and a universal "Hide controls" switch hides every lab's gear at once (a small "show controls" link brings it back).

| Control | Type | Default | Range or options |
|---|---|---|---|
| Resolve speed | range | 33ms/char | 8ms/char to 150ms/char |
| Hold | range | 2000ms | 200ms to 6000ms |
| Scramble speed | range | 33ms/char | 8ms/char to 150ms/char |
| Glyph set | select | Windle classic | Windle classic, Blocks, Binary, Matrix, Custom |
| Custom glyphs | text | (empty) | free text, used when Glyph set is Custom |
| Loop | toggle | on | on/off |
| Scramble spaces | toggle | off | on/off |

Going live: pass `showControls={false}` to hide the gear in production, or keep it and let visitors dial it in.

## Install

1. Download `ScrambleText.tsx` and drop it in (client component). No dependencies.
2. Change `DEFAULT_TEXT` and, if you like, `GLYPHS` and the three timing constants.

## Use

```tsx
import ScrambleText from "@/components/ScrambleText";

export default function Hero() {
    return <ScrambleText />;
}
```

To drive it from a prop, replace the `useState(DEFAULT_TEXT)` initializer with a `text` prop and remove the edit affordance if you don't want visitors changing it.

## Credits

Built on [Text Scramble Effect](https://codepen.io/soulwire/pen/mErPAK) by Justin Windle (MIT). The looping phases, in-place editing and the React packaging were added here. If you build on this, please carry the credit forward the same way.

## License

MIT.

---

Made by [Q Manning](https://qmanning.com) · [Source on GitHub](https://github.com/qmanning/scramble-text) · [See it live in the Labs](https://qmanning.com/labs/scramble-text)
