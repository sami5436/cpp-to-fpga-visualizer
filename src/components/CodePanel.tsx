"use client";

import { CycleState, ModeConfig, SourceLine, STAGES, sourceFor } from "@/lib/sim";

function badge(t: { idx: number[] }): string {
  if (t.idx.length === 1) return `i=${t.idx[0]}`;
  return `i=${t.idx[0]}‥${t.idx[t.idx.length - 1]}`;
}

export default function CodePanel({ mode, state }: { mode: ModeConfig; state: CycleState }) {
  const lines: SourceLine[] = sourceFor(mode);

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            dot8.cpp
          </span>
          <span className="rounded bg-edge px-1.5 py-0.5 font-mono text-[10px] text-dim">C++17</span>
        </div>
        <span className="font-mono text-[10px] text-dim">vitis_hls · -O3</span>
      </header>

      <div className="flex-1 overflow-auto px-1 py-3">
        <pre className="font-mono text-[12.5px] leading-[1.85]">
          {lines.map((l) => {
            const tok = l.stage !== undefined ? state.byStage[l.stage] : undefined;
            const live = !!tok;
            const wbLive = l.writeback && state.result !== null;
            const color = l.stage !== undefined ? STAGES[l.stage].color : "#34d399";
            const on = live || wbLive;

            return (
              <div
                key={l.n}
                className="relative flex items-center gap-3 px-3 transition-colors duration-150"
                style={{
                  background: on ? `${color}14` : undefined,
                  boxShadow: on ? `inset 2px 0 0 ${color}` : undefined,
                }}
              >
                <span className="w-6 shrink-0 select-none text-right text-[11px] text-slate-700">
                  {l.n}
                </span>
                <code
                  className={
                    l.pragma
                      ? "text-amber-300/90"
                      : l.text.trimStart().startsWith("//")
                        ? "text-slate-600"
                        : "text-slate-300"
                  }
                  style={on ? { color } : undefined}
                >
                  {l.text || " "}
                </code>

                {on && (
                  <span
                    className="pop ml-auto shrink-0 rounded px-1.5 py-px font-mono text-[10px] font-semibold"
                    style={{ background: `${color}22`, color }}
                  >
                    {tok ? `${STAGES[l.stage!].label} ${badge(tok)}` : "WRITEBACK"}
                  </span>
                )}
              </div>
            );
          })}
        </pre>
      </div>

      <footer className="border-t border-edge px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
        Lit lines are the ones whose hardware is switching{" "}
        <span className="text-slate-300">this clock cycle</span>. With II=1 several light up at
        once — that is not the CPU running ahead, it is four different iterations occupying four
        different pieces of silicon simultaneously.
      </footer>
    </section>
  );
}
