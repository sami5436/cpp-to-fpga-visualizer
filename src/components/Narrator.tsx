"use client";

import { CycleState, ModeConfig, STAGES, narrate } from "@/lib/sim";

/**
 * A live, plain-English commentary of the current clock cycle. This is the
 * fastest way to see that several *different* elements are being worked on in
 * several *different* places at the same instant.
 */
export default function Narrator({ mode, state }: { mode: ModeConfig; state: CycleState }) {
  const busy = state.tokens.length;

  const headline =
    state.cycle === 0
      ? "Beat 0 — everything is reset. The pot is empty and nobody is working yet."
      : busy === 0
        ? state.result !== null
          ? `Beat ${state.cycle} — the kitchen is empty again and the finished dish (${state.result}) is on the pass.`
          : `Beat ${state.cycle} — nothing in flight yet.`
        : busy === 1
          ? `Beat ${state.cycle} — one thing is happening. The other three stations sit idle.`
          : `Beat ${state.cycle} — ${busy} stations are busy at once, each on a different pair of numbers.`;

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-edge px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10px] tracking-[0.18em] text-cyan-400/80">
          WHAT IS HAPPENING RIGHT NOW
        </span>
        <span className="text-[12.5px] text-slate-200">{headline}</span>
      </div>

      <div className="grid gap-px bg-edge sm:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((st, i) => {
          const tok = state.byStage[i];
          return (
            <div
              key={st.id}
              className="bg-panel px-4 py-3 transition-colors sm:px-5"
              style={{ background: tok ? `${st.color}0f` : undefined }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: tok ? st.color : "#26344a" }}
                />
                <span
                  className="font-mono text-[10px] font-semibold tracking-wider"
                  style={{ color: tok ? st.color : "#4b5b74" }}
                >
                  {st.label}
                </span>
                <span className="font-mono text-[9.5px] text-slate-600">{st.sub}</span>
              </div>

              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400 italic">
                {st.analogy}
              </p>

              <p
                className="mt-1.5 font-mono text-[11px] leading-relaxed"
                style={{ color: tok ? "#e2e8f0" : "#3c4a63" }}
              >
                {tok ? `→ ${narrate(i, tok)}` : "→ idle this beat"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="border-t border-edge px-4 py-2.5 text-[11.5px] leading-relaxed text-slate-500 sm:px-5">
        {mode.ii === 1
          ? "Every station is fed a new pair every single beat — nobody waits for anybody. That is what the pragma bought you."
          : "Watch how three of the four stations sit idle most beats: the recipe insists on finishing one pair before starting the next."}
      </p>
    </section>
  );
}
