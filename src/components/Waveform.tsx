"use client";

import { CycleState, STAGES } from "@/lib/sim";
import Explain from "./Explain";

const ROW = 30;
const LABEL_W = 96;
const TARGET_W = 1360;

/** Widen or narrow the cycle columns so the whole trace always fits the panel. */
function cycleWidth(cycles: number): number {
  return Math.max(22, Math.min(64, (TARGET_W - LABEL_W) / cycles));
}

interface Sig {
  name: string;
  kind: "clock" | "bit" | "bus";
  color: string;
  at: (s: CycleState) => number | string | null;
}

const SIGNALS: Sig[] = [
  { name: "clk", kind: "clock", color: "#94a3b8", at: () => 0 },
  { name: "rst_n", kind: "bit", color: "#f87171", at: (s) => (s.reset ? 0 : 1) },
  {
    name: "i_addr[2:0]",
    kind: "bus",
    color: STAGES[0].color,
    at: (s) => (s.addr !== null ? s.addr : null),
  },
  {
    name: "a_data[15:0]",
    kind: "bus",
    color: STAGES[1].color,
    at: (s) => (s.byStage[1] ? s.byStage[1]!.a[0] : null),
  },
  {
    name: "b_data[15:0]",
    kind: "bus",
    color: STAGES[1].color,
    at: (s) => (s.byStage[1] ? s.byStage[1]!.b[0] : null),
  },
  {
    name: "p_mul[31:0]",
    kind: "bus",
    color: STAGES[2].color,
    at: (s) => (s.byStage[3] ? s.byStage[3]!.sum : null),
  },
  { name: "acc[31:0]", kind: "bus", color: STAGES[3].color, at: (s) => s.acc },
  { name: "out_valid", kind: "bit", color: STAGES[3].color, at: (s) => (s.outValid ? 1 : 0) },
];

export default function Waveform({
  trace,
  cycle,
}: {
  trace: CycleState[];
  cycle: number;
}) {
  const CW = cycleWidth(trace.length);
  const W = LABEL_W + trace.length * CW + 12;
  const H = SIGNALS.length * ROW + 26;

  return (
    <section className="panel flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            WAVEFORM · RTL SIMULATION
          </h2>
          <p className="mt-0.5 text-[11px] text-dim">the same trace a testbench would dump to VCD</p>
        </div>
        <span className="font-mono text-[10px] text-dim">t = {(cycle * 5).toFixed(0)} ns</span>
      </header>

      <Explain panel="waveform" />

      <div className="p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
          {/* cycle ruler */}
          {trace.map((s) => (
            <g key={s.cycle}>
              <line
                x1={LABEL_W + s.cycle * CW}
                y1={18}
                x2={LABEL_W + s.cycle * CW}
                y2={H - 4}
                stroke={s.cycle === cycle ? "#38bdf8" : "#151f2f"}
                strokeWidth={s.cycle === cycle ? 1.5 : 1}
              />
              <text
                x={LABEL_W + s.cycle * CW + CW / 2}
                y={12}
                textAnchor="middle"
                className="font-mono"
                fontSize={9}
                fill={s.cycle === cycle ? "#7dd3fc" : "#3f4d63"}
              >
                {s.cycle}
              </text>
            </g>
          ))}

          {SIGNALS.map((sig, r) => {
            const top = 22 + r * ROW;
            const hi = top + 6;
            const lo = top + 20;
            const mid = (hi + lo) / 2;

            return (
              <g key={sig.name}>
                <text
                  x={LABEL_W - 10}
                  y={mid + 3.5}
                  textAnchor="end"
                  className="font-mono"
                  fontSize={10}
                  fill="#7c8ba1"
                >
                  {sig.name}
                </text>
                <line
                  x1={LABEL_W}
                  y1={lo + 5}
                  x2={W - 12}
                  y2={lo + 5}
                  stroke="#111a28"
                  strokeWidth={1}
                />

                {trace.map((s) => {
                  const x = LABEL_W + s.cycle * CW;
                  const dim = s.cycle > cycle;
                  const op = dim ? 0.16 : 1;

                  if (sig.kind === "clock") {
                    return (
                      <polyline
                        key={s.cycle}
                        points={`${x},${lo} ${x},${hi} ${x + CW / 2},${hi} ${x + CW / 2},${lo} ${x + CW},${lo}`}
                        fill="none"
                        stroke={sig.color}
                        strokeWidth={1.4}
                        opacity={op}
                      />
                    );
                  }

                  const v = sig.at(s);

                  if (sig.kind === "bit") {
                    const y = v ? hi : lo;
                    const prev = s.cycle > 0 ? sig.at(trace[s.cycle - 1]) : 0;
                    const py = prev ? hi : lo;
                    return (
                      <polyline
                        key={s.cycle}
                        points={`${x},${py} ${x},${y} ${x + CW},${y}`}
                        fill="none"
                        stroke={sig.color}
                        strokeWidth={1.6}
                        opacity={op}
                      />
                    );
                  }

                  // bus
                  if (v === null || v === undefined) {
                    return (
                      <line
                        key={s.cycle}
                        x1={x}
                        y1={mid}
                        x2={x + CW}
                        y2={mid}
                        stroke="#33405a"
                        strokeWidth={1.3}
                        strokeDasharray="3 3"
                        opacity={op}
                      />
                    );
                  }
                  const txt = String(v);
                  return (
                    <g key={s.cycle} opacity={op}>
                      <polygon
                        points={`${x + 2},${mid} ${x + 6},${hi} ${x + CW - 6},${hi} ${x + CW - 2},${mid} ${x + CW - 6},${lo} ${x + 6},${lo}`}
                        fill={`${sig.color}1c`}
                        stroke={sig.color}
                        strokeWidth={1.1}
                      />
                      <text
                        x={x + CW / 2}
                        y={mid + 3.5}
                        textAnchor="middle"
                        className="font-mono"
                        fontSize={txt.length > 4 ? 7.5 : 9}
                        fill="#cbd5e1"
                      >
                        {txt}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* the "now" cursor */}
          <rect
            x={LABEL_W + cycle * CW}
            y={16}
            width={CW}
            height={H - 20}
            fill="#38bdf8"
            opacity={0.07}
          />
        </svg>
      </div>
    </section>
  );
}
