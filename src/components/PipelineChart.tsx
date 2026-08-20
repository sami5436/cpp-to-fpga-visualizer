"use client";

import { CycleState, ModeConfig, N, PIPE_DEPTH, STAGES } from "@/lib/sim";

const RH = 22;
const LABEL = 92;
const TARGET_W = 1360;

/** Cycles an in-order scalar core spends per element: ld, ld, mul, add, inc, bne. */
export const CPU_CPI = 6;
const CPU_OPS = ["LD", "LD", "MUL", "ADD", "INC", "BNE"];

export default function PipelineChart({
  mode,
  trace,
  cycle,
}: {
  mode: ModeConfig;
  trace: CycleState[];
  cycle: number;
}) {
  const groups = Math.ceil(N / mode.lanes);
  const cycles = trace.length;
  const CW = Math.max(20, Math.min(52, (TARGET_W - LABEL) / cycles));
  const W = LABEL + cycles * CW + 8;
  const fpgaH = groups * RH;

  const cpuRows = 1;
  const H = 20 + fpgaH + 34 + cpuRows * RH + 16;

  return (
    <section className="panel flex flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-2.5">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            SCHEDULE · WHO IS DOING WHAT, WHEN
          </h2>
          <p className="mt-0.5 text-[11px] text-dim">
            each row is one loop iteration; each column is one 5 ns clock cycle
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          {STAGES.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5" style={{ color: s.color }}>
              <span
                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                style={{ background: `${s.color}55`, border: `1px solid ${s.color}` }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </header>

      <div className="p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
          {Array.from({ length: cycles }, (_, c) => (
            <text
              key={c}
              x={LABEL + c * CW + CW / 2}
              y={11}
              textAnchor="middle"
              className="font-mono"
              fontSize={9}
              fill={c === cycle ? "#7dd3fc" : "#3f4d63"}
            >
              {c}
            </text>
          ))}

          {/* FPGA rows */}
          {Array.from({ length: groups }, (_, g) => {
            const launch = 1 + g * mode.ii;
            const first = g * mode.lanes;
            const last = Math.min(N - 1, first + mode.lanes - 1);
            const label = mode.lanes === 1 ? `i = ${first}` : `i = ${first}‥${last}`;
            const y = 20 + g * RH;
            return (
              <g key={g}>
                <text
                  x={LABEL - 10}
                  y={y + RH / 2 + 3.5}
                  textAnchor="end"
                  className="font-mono"
                  fontSize={10}
                  fill="#7c8ba1"
                >
                  {label}
                </text>
                {Array.from({ length: PIPE_DEPTH }, (_, s) => {
                  const c = launch + s;
                  const st = STAGES[s];
                  const past = c <= cycle;
                  return (
                    <g key={s}>
                      <rect
                        x={LABEL + c * CW + 1}
                        y={y + 2}
                        width={CW - 2}
                        height={RH - 4}
                        rx={3}
                        fill={c === cycle ? `${st.color}66` : past ? `${st.color}26` : `${st.color}0e`}
                        stroke={c === cycle ? st.color : `${st.color}44`}
                        strokeWidth={c === cycle ? 1.5 : 1}
                        style={{ transition: "fill .15s" }}
                      />
                      <text
                        x={LABEL + c * CW + CW / 2}
                        y={y + RH / 2 + 3}
                        textAnchor="middle"
                        className="font-mono"
                        fontSize={7.5}
                        fill={past ? st.color : `${st.color}77`}
                      >
                        {st.label.slice(0, 3)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* CPU comparison row */}
          <text
            x={LABEL - 10}
            y={20 + fpgaH + 30}
            textAnchor="end"
            className="font-mono"
            fontSize={10}
            fill="#7c8ba1"
          >
            scalar CPU
          </text>
          <text
            x={LABEL}
            y={20 + fpgaH + 18}
            className="font-mono"
            fontSize={9}
            fill="#475569"
          >
            same C++ on an in-order core — one instruction retires per cycle
          </text>
          {Array.from({ length: cycles }, (_, c) => {
            const el = Math.floor(c / CPU_CPI);
            if (el >= N) return null;
            const op = CPU_OPS[c % CPU_CPI];
            const y = 20 + fpgaH + 34;
            const past = c <= cycle;
            return (
              <g key={c}>
                <rect
                  x={LABEL + c * CW + 1}
                  y={y + 2}
                  width={CW - 2}
                  height={RH - 4}
                  rx={3}
                  fill={c === cycle ? "#64748b66" : past ? "#64748b22" : "#64748b0e"}
                  stroke={c === cycle ? "#94a3b8" : "#64748b3a"}
                  strokeWidth={c === cycle ? 1.5 : 1}
                />
                <text
                  x={LABEL + c * CW + CW / 2}
                  y={y + RH / 2 + 3}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={7.5}
                  fill={past ? "#cbd5e1" : "#4b5b74"}
                >
                  {op}
                </text>
                <text
                  x={LABEL + c * CW + CW / 2}
                  y={y + RH + 10}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={7}
                  fill="#3f4d63"
                >
                  {c % CPU_CPI === 0 ? `i${el}` : ""}
                </text>
              </g>
            );
          })}

          <line
            x1={LABEL + cycle * CW + CW / 2}
            y1={14}
            x2={LABEL + cycle * CW + CW / 2}
            y2={H - 8}
            stroke="#38bdf8"
            strokeWidth={1}
            opacity={0.5}
          />
        </svg>
      </div>
    </section>
  );
}
