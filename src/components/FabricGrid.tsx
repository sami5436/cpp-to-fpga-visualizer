"use client";

import { useMemo } from "react";
import { CycleState, ModeConfig, STAGES } from "@/lib/sim";

const COLS = 30;
const ROWS = 14;
const CELL = 24;
const PAD = 3;

type Kind = "clb" | "bram" | "dsp" | "io";

function kindOf(c: number): Kind {
  if (c === 0 || c === COLS - 1) return "io";
  if (c % 9 === 4) return "bram";
  if (c % 9 === 7) return "dsp";
  return "clb";
}

const KIND_STYLE: Record<Kind, { fill: string; stroke: string; label: string }> = {
  clb: { fill: "#0d1522", stroke: "#1b2740", label: "CLB — logic + flip-flops" },
  bram: { fill: "#0c1a20", stroke: "#1b3540", label: "BRAM — 18Kb block RAM" },
  dsp: { fill: "#1c1608", stroke: "#3a2d10", label: "DSP48 — hard multiplier" },
  io: { fill: "#150e1f", stroke: "#2c1f42", label: "IOB — package pins" },
};

interface Placed {
  id: string;
  label: string;
  /** extra callouts on a replicated module just add clutter */
  hideLabel?: boolean;
  stage: number | "out";
  color: string;
  tiles: [number, number][];
}

function center(t: [number, number]): [number, number] {
  return [t[0] * CELL + CELL / 2, t[1] * CELL + CELL / 2];
}

function usePlacement(mode: ModeConfig): Placed[] {
  return useMemo(() => {
    const L = mode.lanes;
    const dspRows =
      L === 1 ? [6] : L === 2 ? [4, 8] : [2, 5, 8, 11];

    const mods: Placed[] = [
      {
        id: "ctrl",
        label: "loop FSM / addr gen",
        stage: 0,
        color: STAGES[0].color,
        tiles: [
          [2, 6],
          [2, 7],
          [3, 6],
        ],
      },
      {
        id: "brama",
        label: "BRAM_A",
        stage: 1,
        color: STAGES[1].color,
        tiles: [
          [4, 2],
          [4, 3],
        ],
      },
      {
        id: "bramb",
        label: "BRAM_B",
        stage: 1,
        color: STAGES[1].color,
        tiles: [
          [4, 10],
          [4, 11],
        ],
      },
      ...dspRows.slice(0, L).map<Placed>((r, i) => ({
        id: `dsp${i}`,
        label: L > 1 ? `DSP48 \u00d7${L}` : "DSP48",
        hideLabel: i > 0,
        stage: 2,
        color: STAGES[2].color,
        tiles: [[7, r]],
      })),
      {
        id: "acc",
        label: L > 1 ? "adder tree + ACC" : "accumulator",
        stage: 3,
        color: STAGES[3].color,
        tiles:
          L > 1
            ? [
                [10, 5],
                [10, 6],
                [10, 7],
                [11, 6],
                [11, 7],
              ]
            : [
                [10, 6],
                [11, 6],
              ],
      },
      {
        id: "axi",
        label: "AXI-Stream out",
        stage: "out",
        color: STAGES[3].color,
        tiles: [
          [29, 6],
          [29, 7],
        ],
      },
    ];
    return mods;
  }, [mode.lanes]);
}

export default function FabricGrid({ mode, state }: { mode: ModeConfig; state: CycleState }) {
  const placed = usePlacement(mode);

  const owner = useMemo(() => {
    const m = new Map<string, Placed>();
    for (const p of placed) for (const t of p.tiles) m.set(`${t[0]}:${t[1]}`, p);
    return m;
  }, [placed]);

  const isLive = (p: Placed) =>
    p.stage === "out" ? state.result !== null : !!state.byStage[p.stage];

  const W = COLS * CELL;
  const H = ROWS * CELL;

  const nets: { from: string; to: string; live: boolean }[] = [
    { from: "ctrl", to: "brama", live: !!state.byStage[0] },
    { from: "ctrl", to: "bramb", live: !!state.byStage[0] },
    ...placed
      .filter((p) => p.id.startsWith("dsp"))
      .flatMap((d) => [
        { from: "brama", to: d.id, live: !!state.byStage[1] },
        { from: "bramb", to: d.id, live: !!state.byStage[1] },
        { from: d.id, to: "acc", live: !!state.byStage[2] || !!state.byStage[3] },
      ]),
    { from: "acc", to: "axi", live: state.result !== null },
  ];

  const byId = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);

  const used = placed.reduce((s, p) => s + p.tiles.length, 0);
  const total = COLS * ROWS;

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            FABRIC FLOORPLAN
          </h2>
          <p className="mt-0.5 text-[11px] text-dim">
            where the design physically lands on the die
          </p>
        </div>
        <span className="font-mono text-[10px] text-dim">
          {used}/{total} tiles · {((used / total) * 100).toFixed(1)}%
        </span>
      </header>

      <div className="flex flex-1 items-center overflow-x-auto p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px]">
          {/* the sea of unconfigured tiles */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const k = kindOf(c);
              const p = owner.get(`${c}:${r}`);
              const live = p ? isLive(p) : false;
              const st = KIND_STYLE[k];
              return (
                <rect
                  key={`${c}:${r}`}
                  x={c * CELL + PAD / 2}
                  y={r * CELL + PAD / 2}
                  width={CELL - PAD}
                  height={CELL - PAD}
                  rx={2.5}
                  fill={p ? (live ? `${p.color}3a` : `${p.color}14`) : st.fill}
                  stroke={p ? (live ? p.color : `${p.color}55`) : st.stroke}
                  strokeWidth={live ? 1.4 : 0.9}
                  style={{ transition: "fill .15s, stroke .15s" }}
                >
                  <title>{p ? `${p.label} — ${st.label}` : st.label}</title>
                </rect>
              );
            }),
          )}

          {/* routed nets between placed modules */}
          {nets.map((n, i) => {
            const a = byId.get(n.from);
            const b = byId.get(n.to);
            if (!a || !b) return null;
            const [x1, y1] = center(a.tiles[a.tiles.length - 1]);
            const [x2, y2] = center(b.tiles[0]);
            const midX = (x1 + x2) / 2;
            const pts = `${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
            return (
              <g key={i}>
                <polyline points={pts} fill="none" stroke="#1e2b40" strokeWidth={1.2} />
                {n.live && (
                  <polyline
                    points={pts}
                    fill="none"
                    stroke={b.color}
                    strokeWidth={1.6}
                    opacity={0.9}
                    className="flow"
                  />
                )}
              </g>
            );
          })}

          {/* module callouts */}
          {placed.filter((p) => !p.hideLabel).map((p) => {
            const [cx, cy] = center(p.tiles[0]);
            const live = isLive(p);
            const end = p.id === "axi";
            const tw = p.label.length * 4.6 + 8;
            const tx = cx + (end ? -8 : 0);
            return (
              <g key={p.id} opacity={live ? 1 : 0.7}>
                <rect
                  x={end ? tx - tw : tx - tw / 2}
                  y={cy - 23}
                  width={tw}
                  height={11}
                  rx={2}
                  fill="#05070d"
                  stroke={live ? `${p.color}88` : "#1c2635"}
                  strokeWidth={0.7}
                />
                <text
                  x={end ? tx - 4 : tx}
                  y={cy - 15}
                  textAnchor={end ? "end" : "middle"}
                  className="font-mono"
                  fontSize={7.5}
                  fill={live ? p.color : "#7c8ba1"}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-edge px-4 py-2.5 text-[10px] text-dim">
        {(["clb", "bram", "dsp", "io"] as Kind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ background: KIND_STYLE[k].fill, border: `1px solid ${KIND_STYLE[k].stroke}` }}
            />
            {KIND_STYLE[k].label}
          </span>
        ))}
      </footer>
    </section>
  );
}
