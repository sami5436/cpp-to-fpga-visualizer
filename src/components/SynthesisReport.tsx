"use client";

import { CLOCK_MHZ, Estimate, ModeConfig, NS_PER_CYCLE } from "@/lib/sim";

// Budget of a small Artix-7 class part (XC7A35T).
const DEVICE = { lut: 20800, ff: 41600, dsp: 90, bram: 50 };

function Bar({
  label,
  used,
  total,
  color,
}: {
  label: string;
  used: number;
  total: number;
  color: string;
}) {
  const pct = (used / total) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[11px]">
        <span className="text-dim">{label}</span>
        <span className="text-slate-300">
          {used.toLocaleString()}
          <span className="text-slate-600"> / {total.toLocaleString()}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-edge">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${Math.max(pct, 1.2)}%`, background: color }}
        />
      </div>
      <div className="mt-0.5 text-right font-mono text-[9.5px] text-slate-600">
        {pct < 0.1 ? "<0.1" : pct.toFixed(1)}%
      </div>
    </div>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-md border border-edge bg-panel-2 px-3 py-2">
      <div className="font-mono text-[9.5px] tracking-wider text-dim">{k}</div>
      <div className="mt-0.5 font-mono text-[15px] font-semibold text-slate-100">{v}</div>
      {sub && <div className="font-mono text-[9.5px] text-slate-600">{sub}</div>}
    </div>
  );
}

export default function SynthesisReport({
  mode,
  est,
}: {
  mode: ModeConfig;
  est: Estimate;
}) {
  const throughput = mode.lanes * CLOCK_MHZ; // MMAC/s
  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="border-b border-edge px-4 py-2.5">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
          SYNTHESIS REPORT
        </h2>
        <p className="mt-0.5 text-[11px] text-dim">what the toolchain would hand back</p>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3">
        <Stat k="INITIATION INTERVAL" v={`${est.ii} cyc`} sub={est.ii === 1 ? "one launch/clock" : "loop serialized"} />
        <Stat
          k="TOTAL LATENCY"
          v={`${est.latency} cyc`}
          sub={`${(est.latency * NS_PER_CYCLE).toFixed(0)} ns @ ${CLOCK_MHZ} MHz`}
        />
        <Stat k="TIMING (Fmax)" v={`${est.fmax} MHz`} sub={`${(1000 / est.fmax).toFixed(2)} ns critical path`} />
        <Stat
          k="THROUGHPUT"
          v={`${throughput >= 1000 ? (throughput / 1000).toFixed(1) + " G" : throughput + " M"}MAC/s`}
          sub={`${mode.lanes} MAC per clock`}
        />
      </div>

      <div className="space-y-3 border-t border-edge px-4 py-3">
        <Bar label="LUT" used={est.lut} total={DEVICE.lut} color="#22d3ee" />
        <Bar label="FF" used={est.ff} total={DEVICE.ff} color="#a78bfa" />
        <Bar label="DSP48" used={est.dsp} total={DEVICE.dsp} color="#fbbf24" />
        <Bar label="BRAM18" used={est.bram} total={DEVICE.bram} color="#34d399" />
      </div>

      <p className="mt-auto border-t border-edge px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        {mode.blurb}
      </p>
    </section>
  );
}
