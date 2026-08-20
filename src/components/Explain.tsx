"use client";

import { ANALOGIES, PANEL_LEAD, PanelKey } from "@/lib/analogies";

/**
 * The plain-English strip that sits inside every panel, directly under its
 * header — so the explanation is next to the thing it explains rather than
 * parked in a glossary nobody scrolls to.
 */
export default function Explain({ panel }: { panel: PanelKey }) {
  const items = ANALOGIES.filter((a) => a.panel === panel);

  return (
    <details className="group border-b border-edge bg-cyan-400/[0.035]">
      <summary className="flex cursor-pointer list-none items-start gap-2.5 px-4 py-2.5 hover:bg-cyan-400/[0.05] sm:px-5">
        <span className="mt-px shrink-0 text-[11px]" aria-hidden>
          💡
        </span>
        <span className="text-[12px] leading-relaxed text-slate-300">{PANEL_LEAD[panel]}</span>
        <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-[10px] text-cyan-400/80">
          <span className="group-open:hidden">
            {items.length} term{items.length > 1 ? "s" : ""} ▾
          </span>
          <span className="hidden group-open:inline">close ▴</span>
        </span>
      </summary>

      <div className="grid gap-px border-t border-edge bg-edge sm:grid-cols-2">
        {items.map((a) => (
          <div key={a.term} className="bg-panel px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h4 className="text-[12.5px] font-semibold" style={{ color: a.color }}>
                {a.term}
              </h4>
              {a.aka && <span className="font-mono text-[9.5px] text-slate-600">{a.aka}</span>}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{a.plain}</p>
            <p
              className="mt-1.5 border-l-2 pl-2.5 text-[12px] leading-relaxed text-slate-400 italic"
              style={{ borderColor: `${a.color}55` }}
            >
              {a.analogy}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
