// Lab: "Scramble/Unscramble Text". Text resolves out of glyph noise, holds,
// scrambles back, loops. Click the text to edit it in place (≤150 chars, wraps);
// "Try It" (a bigger FREE-style button, centered) arms when you type, applies
// your text, and disarms until you type again.
// Credit: the resolve-out-of-noise technique and glyph set come from Justin Windle's
// "Text Scramble Effect" (CodePen, MIT): https://codepen.io/soulwire/pen/mErPAK
"use client";

import { useEffect, useRef, useState } from "react";
import LabSettings, { useLabSettings, type LabSettingSchema, type LabSettingsValue } from "@/components/labs/LabSettings";

const DEFAULT = "Use it on a single sentence, or a whole paragraph.";
const GLYPHS_WINDLE = "!<>-_\\/[]{}—=+*^?#________";
const GLYPHS_BLOCKS = "▁▂▃▄▅▆▇█";
const GLYPHS_BINARY = "01";
const GLYPHS_MATRIX = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
const GLYPH_SETS: Record<string, string> = { windle: GLYPHS_WINDLE, blocks: GLYPHS_BLOCKS, binary: GLYPHS_BINARY, matrix: GLYPHS_MATRIX };
const MAX = 150;

export const SCRAMBLE_SETTINGS: LabSettingSchema = [
    { key: "resolveMs", label: "Resolve speed", kind: "range", default: 33, min: 8, max: 150, step: 1, unit: "ms/char" },
    { key: "holdMs", label: "Hold", kind: "range", default: 2000, min: 200, max: 6000, step: 100, unit: "ms" },
    { key: "scrambleMs", label: "Scramble speed", kind: "range", default: 33, min: 8, max: 150, step: 1, unit: "ms/char" },
    {
        key: "glyphs",
        label: "Glyph set",
        kind: "select",
        default: "windle",
        options: [
            { value: "windle", label: "Windle classic" },
            { value: "blocks", label: "Blocks" },
            { value: "binary", label: "Binary" },
            { value: "matrix", label: "Matrix" },
            { value: "custom", label: "Custom" },
        ],
    },
    { key: "customGlyphs", label: "Custom glyphs", kind: "text", default: "" },
    { key: "loop", label: "Loop", kind: "toggle", default: true },
    { key: "scrambleSpaces", label: "Scramble spaces", kind: "toggle", default: false },
];

function resolveGlyphs(value: LabSettingsValue): string {
    const key = String(value.glyphs ?? "windle");
    if (key === "custom") {
        const custom = String(value.customGlyphs ?? "");
        return custom.length > 0 ? custom : GLYPHS_WINDLE;
    }
    return GLYPH_SETS[key] ?? GLYPHS_WINDLE;
}

export default function ScrambleText() {
    const { value, setValue, reset, save } = useLabSettings(SCRAMBLE_SETTINGS, "lab:scramble-text");
    const [source, setSource] = useState(DEFAULT);
    const [run, setRun] = useState(0); // bump to restart the animation from full scramble
    const [text, setText] = useState(DEFAULT);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(DEFAULT);
    const [armed, setArmed] = useState(false);
    const sourceRef = useRef(source);
    sourceRef.current = source;
    const box = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editing) return; // freeze the animation while editing
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setText(source); return; }
        const glyphs = resolveGlyphs(value);
        const resolveMs = Math.max(1, Number(value.resolveMs) || 1);
        const holdMs = Math.max(0, Number(value.holdMs) || 0);
        const scrambleMs = Math.max(1, Number(value.scrambleMs) || 1);
        const loop = value.loop !== false;
        const scrambleSpaces = Boolean(value.scrambleSpaces);
        let raf = 0, phase: "in" | "hold" | "out" = "in", phaseStart = performance.now();
        const render = (t: string, revealed: number) =>
            t.split("").map((ch, i) => (!scrambleSpaces && ch === " ") ? " " : revealed > i ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join("");
        const tick = (now: number) => {
            const t = sourceRef.current;
            if (phase === "in") {
                const revealed = Math.floor((now - phaseStart) / resolveMs);
                setText(render(t, revealed));
                if (revealed >= t.length) { phase = "hold"; phaseStart = now; }
            } else if (phase === "hold") {
                if (now - phaseStart >= holdMs) { phase = "out"; phaseStart = now; }
            } else {
                const revealed = t.length - Math.floor((now - phaseStart) / scrambleMs);
                setText(render(t, revealed));
                if (revealed <= 0) {
                    if (!loop) return; // one cycle and stop, fully scrambled
                    phase = "in"; phaseStart = now;
                }
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [source, editing, run, value.resolveMs, value.holdMs, value.scrambleMs, value.glyphs, value.customGlyphs, value.loop, value.scrambleSpaces]);

    useEffect(() => { if (editing) box.current?.focus(); }, [editing]);

    const textClass = "w-full break-words text-center font-mono text-[14px] leading-[22px] tracking-[0.04em]";

    return (
        <div className="group relative flex h-full w-full flex-col items-center justify-start px-6 pt-[112px]">
            <LabSettings
                schema={SCRAMBLE_SETTINGS}
                value={value}
                onChange={setValue}
                onReset={reset}
                onSave={save}
                storageKey="lab:scramble-text"
                title="Scramble settings"
                anchor="top-right"
            />
            {editing ? (
                <textarea
                    ref={box}
                    value={draft}
                    maxLength={MAX}
                    rows={4}
                    onChange={(e) => { setDraft(e.target.value); setArmed(e.target.value.trim().length > 0 && e.target.value.trim() !== source); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`${textClass} h26-scramble-edit`}
                    aria-label="Text to scramble"
                />
            ) : (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setDraft(source); setEditing(true); }}
                    className={`${textClass} h26-scramble-text h26-tip`}
                    data-tip="Click to Change Text"
                >
                    {text}
                </button>
            )}
            <button
                type="button"
                disabled={!armed}
                onClick={(e) => { e.preventDefault(); const next = draft.trim(); setSource(next); setText(next.replace(/[^ ]/g, "_")); setArmed(false); setEditing(false); setRun((r) => r + 1); }}
                className="h26-try mt-6"
            >
                Try It
            </button>
        </div>
    );
}
