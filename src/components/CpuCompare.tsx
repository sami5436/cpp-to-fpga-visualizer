"use client";

import { CLOCK_MHZ, ModeConfig } from "@/lib/sim";
import { CPU_CPI } from "./PipelineChart";

const CPU_GHZ = 3.2;
const CPU_W = 65;
const DEVICE_DSPS = 90;

interface Row {
  name: string;
  note: string;
  mmacs: number;
  watts: number;
  jitter: string;
  accent: string;
  highlight?: boolean;
}

export default function CpuCompare({ mode }: { mode: ModeConfig }) {
  const fpgaMmacs = mode.lanes * CLOCK_MHZ;
  const fpgaW = 2.4 + mode.lanes * 0.35;

  const rows: Row[] = [
    {
      name: "CPU · scalar",
      note: `the same C++, -O0-ish: ${CPU_CPI} cycles per element`,
      mmacs: (CPU_GHZ * 1000) / CPU_CPI,
      watts: CPU_W,
      jitter: "± µs — OS, cache, branches",
      accent: "#64748b",
    },
    {
      name: "CPU · AVX2 auto-vectorized",
      note: "8-wide FMA, realistically memory-bound",
      mmacs: 12800,
      watts: CPU_W,
      jitter: "± µs — same sources",
      accent: "#94a3b8",
    },
    {
      name: `FPGA · this build (${mode.short})`,
      note: `${mode.lanes} DSP slice${mode.lanes > 1 ? "s" : ""} of ${DEVICE_DSPS} on the part`,
      mmacs: fpgaMmacs,
      watts: fpgaW,
      jitter: "0 cycles — exact, every run",
      accent: "#22d3ee",
      highlight: true,
    },
    {
      name: "FPGA · unrolled to fill the die",
      note: `all ${DEVICE_DSPS} DSPs, same 200 MHz clock`,
      mmacs: DEVICE_DSPS * CLOCK_MHZ,
      watts: 7.8,
      jitter: "0 cycles — exact, every run",
      accent: "#34d399",
    },
  ];

  const effs = rows.map((r) => r.mmacs / r.watts);
  const maxEff = Math.max(...effs);
  const minEff = Math.min(...effs);
  // Two and a half orders of magnitude separate these — linear bars would be a flat line.
  const barPct = (e: number) =>
    12 + 88 * ((Math.log10(e) - Math.log10(minEff)) / (Math.log10(maxEff) - Math.log10(minEff)));

  const fmt = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} GMAC/s` : `${m.toFixed(0)} MMAC/s`);

  return (
    <section className="panel overflow-hidden">
      <header className="border-b border-edge px-4 py-2.5">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
          WHY BOTHER? CPU vs FABRIC
        </h2>
        <p className="mt-0.5 text-[11px] text-dim">
          same algorithm, four different pieces of silicon
        </p>
      </header>

      <div className="divide-y divide-edge">
        {rows.map((r) => {
          const eff = r.mmacs / r.watts;
          return (
            <div
              key={r.name}
              className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center"
              style={r.highlight ? { background: "rgba(34,211,238,0.05)" } : undefined}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: r.accent }}
                  />
                  <span className="text-[12.5px] text-slate-200">{r.name}</span>
                </div>
                <div className="mt-0.5 pl-4 font-mono text-[10px] text-dim">{r.note}</div>
              </div>

              <div>
                <div className="font-mono text-[12px] text-slate-200">{fmt(r.mmacs)}</div>
                <div className="font-mono text-[10px] text-dim">{r.watts.toFixed(1)} W</div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${barPct(eff)}%`, background: r.accent }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[10.5px] text-slate-300">
                    {eff.toFixed(0)}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-dim">
                  MMAC/J (log scale) · jitter {r.jitter.split("—")[0].trim()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="border-t border-edge px-4 py-3 text-[11.5px] leading-relaxed text-slate-500">
        A well-vectorized CPU is not easy to beat on raw throughput, and this page does not pretend
        otherwise. What the fabric buys you is on the other two axes: MACs per joule, and a latency
        that is the <span className="text-slate-300">same integer number of cycles on every single
        run</span> — no scheduler, no cache miss, no branch predictor. That is why FPGAs live in
        radar front-ends, trading NICs, and motor controllers rather than in spreadsheets.
      </p>
    </section>
  );
}
