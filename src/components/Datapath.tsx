"use client";

import { CycleState, ModeConfig, STAGES } from "@/lib/sim";

const OFF = "#243247";

/** Manhattan (right-angle) routing, the way a real floorplan routes nets. */
function route(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

function Net({
  pts,
  on,
  color,
}: {
  pts: [number, number][];
  on: boolean;
  color: string;
}) {
  return (
    <>
      <polyline points={route(pts)} fill="none" stroke={OFF} strokeWidth={1.6} />
      {on && (
        <polyline
          points={route(pts)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          className="flow"
          opacity={0.95}
        />
      )}
    </>
  );
}

function Block({
  x,
  y,
  w,
  h,
  title,
  value,
  on,
  color,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  value?: string;
  on: boolean;
  color: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={on ? `${color}1f` : "#0d1421"}
        stroke={on ? color : "#22304a"}
        strokeWidth={on ? 1.7 : 1.2}
        style={{ transition: "fill .15s, stroke .15s" }}
      />
      <text
        x={x + w / 2}
        y={value ? y + h / 2 - 3 : y + h / 2 + 4}
        textAnchor="middle"
        className="font-mono"
        fontSize={10}
        fill={on ? color : "#64748b"}
        letterSpacing="0.06em"
      >
        {title}
      </text>
      {value && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 11}
          textAnchor="middle"
          className="font-mono"
          fontSize={11}
          fontWeight={600}
          fill={on ? "#e2e8f0" : "#3c4a63"}
        >
          {value}
        </text>
      )}
    </g>
  );
}

export default function Datapath({ mode, state }: { mode: ModeConfig; state: CycleState }) {
  const L = mode.lanes;
  const rowH = 54;
  const topY = 62;
  const H = topY + L * rowH + 46;

  const fetchTok = state.byStage[0];
  const loadTok = state.byStage[1];
  const mulTok = state.byStage[2];
  const accTok = state.byStage[3];

  const rows = Array.from({ length: L }, (_, l) => topY + l * rowH);
  const centerY = topY + ((L - 1) * rowH) / 2;

  const bramAy = 58;
  const bramBy = 112;
  const treeX = 470;
  const treeW = 92;
  const addX = 636;
  const accX = 700;
  const accW = 96;

  const cFetch = STAGES[0].color;
  const cLoad = STAGES[1].color;
  const cMul = STAGES[2].color;
  const cAcc = STAGES[3].color;

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            SYNTHESIZED DATAPATH
          </h2>
          <p className="mt-0.5 text-[11px] text-dim">
            registers, DSP slices and block RAM inferred from the loop body
          </p>
        </div>
        <div className="flex gap-1.5">
          {STAGES.map((s, i) => {
            const on = !!state.byStage[i];
            return (
              <span
                key={s.id}
                className="rounded px-2 py-1 font-mono text-[10px] transition-colors"
                style={{
                  background: on ? `${s.color}1f` : "#0d1421",
                  color: on ? s.color : "#3c4a63",
                  border: `1px solid ${on ? s.color + "66" : "#1c2635"}`,
                }}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      </header>

      <div className="flex flex-1 items-center overflow-x-auto p-3">
        <svg viewBox={`0 0 960 ${H}`} className="h-auto w-full min-w-[720px]">
          {/* address generator + memories -------------------------------- */}
          <Block
            x={26}
            y={16}
            w={112}
            h={26}
            title="ADDR CNT"
            value={state.addr !== null ? `i = ${state.addr}` : "idle"}
            on={!!fetchTok}
            color={cFetch}
          />
          <Net
            pts={[
              [26, 29],
              [12, 29],
              [12, bramAy + 21],
              [26, bramAy + 21],
            ]}
            on={!!fetchTok}
            color={cFetch}
          />
          <Net
            pts={[
              [12, bramAy + 21],
              [12, bramBy + 21],
              [26, bramBy + 21],
            ]}
            on={!!fetchTok}
            color={cFetch}
          />

          <Block
            x={26}
            y={bramAy}
            w={112}
            h={42}
            title="BRAM_A"
            value={`${L * 16}b port`}
            on={!!fetchTok || !!loadTok}
            color={cFetch}
          />
          <Block
            x={26}
            y={bramBy}
            w={112}
            h={42}
            title="BRAM_B"
            value={`${L * 16}b port`}
            on={!!fetchTok || !!loadTok}
            color={cFetch}
          />

          {/* per-lane front end ------------------------------------------ */}
          {rows.map((y, l) => {
            const yA = y - 13;
            const yB = y + 13;
            const on = !!loadTok;
            const mOn = !!mulTok;
            return (
              <g key={l}>
                <Net
                  pts={[
                    [138, bramAy + 21],
                    [168, bramAy + 21],
                    [168, yA],
                    [232, yA],
                  ]}
                  on={on}
                  color={cLoad}
                />
                <Net
                  pts={[
                    [138, bramBy + 21],
                    [190, bramBy + 21],
                    [190, yB],
                    [232, yB],
                  ]}
                  on={on}
                  color={cLoad}
                />

                <Block
                  x={232}
                  y={yA - 11}
                  w={56}
                  h={22}
                  title=""
                  value={on ? String(loadTok!.a[l]) : "—"}
                  on={on}
                  color={cLoad}
                />
                <Block
                  x={232}
                  y={yB - 11}
                  w={56}
                  h={22}
                  title=""
                  value={on ? String(loadTok!.b[l]) : "—"}
                  on={on}
                  color={cLoad}
                />
                <text
                  x={260}
                  y={yA - 15}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={8}
                  fill="#4b5b74"
                >
                  a_reg{L > 1 ? l : ""}
                </text>

                {/* into the multiplier */}
                <Net
                  pts={[
                    [288, yA],
                    [352, yA],
                    [352, y - 8],
                    [384, y - 8],
                  ]}
                  on={mOn}
                  color={cMul}
                />
                <Net
                  pts={[
                    [288, yB],
                    [352, yB],
                    [352, y + 8],
                    [384, y + 8],
                  ]}
                  on={mOn}
                  color={cMul}
                />

                <circle
                  cx={402}
                  cy={y}
                  r={18}
                  fill={mOn ? `${cMul}22` : "#0d1421"}
                  stroke={mOn ? cMul : "#22304a"}
                  strokeWidth={mOn ? 1.8 : 1.2}
                  style={{ transition: "fill .15s, stroke .15s" }}
                />
                <text
                  x={402}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={15}
                  fill={mOn ? cMul : "#3c4a63"}
                >
                  ×
                </text>
                <text
                  x={402}
                  y={y - 24}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={8}
                  fill={mOn ? cMul : "#4b5b74"}
                >
                  DSP48{L > 1 ? `_${l}` : ""}
                </text>
                {mOn && (
                  <text
                    x={438}
                    y={y - 6}
                    className="font-mono pop"
                    fontSize={10}
                    fontWeight={600}
                    fill="#e2e8f0"
                  >
                    {mulTok!.prod[l]}
                  </text>
                )}

                {/* multiplier → adder tree (or straight to the accumulator) */}
                <Net
                  pts={
                    L > 1
                      ? [
                          [420, y],
                          [treeX, y],
                        ]
                      : [
                          [420, y],
                          [addX - 18, y],
                        ]
                  }
                  on={!!accTok || mOn}
                  color={cAcc}
                />
              </g>
            );
          })}

          {/* adder tree --------------------------------------------------- */}
          {L > 1 && (
            <>
              <Block
                x={treeX}
                y={topY - 26}
                w={treeW}
                h={(L - 1) * rowH + 52}
                title="ADDER TREE"
                value={accTok ? `Σ = ${accTok.sum}` : `${L}→1`}
                on={!!accTok}
                color={cAcc}
              />
              <Net
                pts={[
                  [treeX + treeW, centerY],
                  [addX - 18, centerY],
                ]}
                on={!!accTok}
                color={cAcc}
              />
            </>
          )}

          {/* accumulator -------------------------------------------------- */}
          <circle
            cx={addX}
            cy={centerY}
            r={18}
            fill={accTok ? `${cAcc}22` : "#0d1421"}
            stroke={accTok ? cAcc : "#22304a"}
            strokeWidth={accTok ? 1.8 : 1.2}
            style={{ transition: "fill .15s, stroke .15s" }}
          />
          <text
            x={addX}
            y={centerY + 6}
            textAnchor="middle"
            fontSize={16}
            fill={accTok ? cAcc : "#3c4a63"}
          >
            +
          </text>

          <Net
            pts={[
              [addX + 18, centerY],
              [accX, centerY],
            ]}
            on={!!accTok}
            color={cAcc}
          />
          <Block
            x={accX}
            y={centerY - 22}
            w={accW}
            h={44}
            title="ACC  int32"
            value={String(state.acc)}
            on={!!accTok || state.acc !== 0}
            color={cAcc}
          />

          {/* accumulator feedback loop */}
          <Net
            pts={[
              [accX + accW / 2, centerY + 22],
              [accX + accW / 2, H - 20],
              [addX, H - 20],
              [addX, centerY + 18],
            ]}
            on={!!accTok}
            color={cAcc}
          />
          <text
            x={addX + 46}
            y={H - 25}
            className="font-mono"
            fontSize={8}
            fill={accTok ? cAcc : "#4b5b74"}
          >
            feedback · 1 cycle
          </text>

          {/* output port -------------------------------------------------- */}
          <Net
            pts={[
              [accX + accW, centerY],
              [860, centerY],
            ]}
            on={state.result !== null}
            color={cAcc}
          />
          <Block
            x={860}
            y={centerY - 21}
            w={86}
            h={42}
            title="M_AXIS"
            value={state.result !== null ? String(state.result) : "—"}
            on={state.result !== null}
            color={cAcc}
          />
          {state.outValid && (
            <text
              x={903}
              y={centerY - 28}
              textAnchor="middle"
              className="font-mono blink"
              fontSize={9}
              fontWeight={700}
              fill={cAcc}
            >
              VALID ↑
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 border-t border-edge sm:grid-cols-4">
        {STAGES.map((st, i) => {
          const tok = state.byStage[i];
          return (
            <div
              key={st.id}
              className="border-r border-edge px-3 py-2.5 last:border-r-0"
              style={{ background: tok ? `${st.color}0d` : undefined }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-mono text-[10px] font-semibold tracking-wider"
                  style={{ color: tok ? st.color : "#4b5b74" }}
                >
                  {st.label}
                </span>
                {tok && (
                  <span
                    className="pop rounded px-1.5 py-px font-mono text-[9px]"
                    style={{ background: `${st.color}22`, color: st.color }}
                  >
                    {tok.idx.length === 1
                      ? `i=${tok.idx[0]}`
                      : `i=${tok.idx[0]}\u2025${tok.idx[tok.idx.length - 1]}`}
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-dim">{st.sub}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
