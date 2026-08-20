"use client";


const MACHINES = [
  { label: "WASH", color: "#22d3ee" },
  { label: "DRY", color: "#fbbf24" },
  { label: "FOLD", color: "#34d399" },
];

/** The laundry version of the Schedule chart further up the page. Both charts
 *  share one viewBox so the "5 beats" one is visibly shorter, not just smaller. */
const SPAN = 9;

function MiniGantt({ ii, finish }: { ii: number; finish: number }) {
  const CW = 34;
  const RH = 26;
  const LABEL = 56;
  const W = LABEL + SPAN * CW + 10;
  const H = 16 + 3 * RH + 16;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[460px]">
      {Array.from({ length: SPAN + 1 }, (_, c) => (
        <line
          key={c}
          x1={LABEL + c * CW}
          y1={14}
          x2={LABEL + c * CW}
          y2={H - 16}
          stroke="#151f2f"
          strokeWidth={1}
        />
      ))}

      {[0, 1, 2].map((load) => {
        const start = load * ii;
        const y = 16 + load * RH;
        return (
          <g key={load}>
            <text
              x={LABEL - 8}
              y={y + RH / 2 + 3}
              textAnchor="end"
              className="font-mono"
              fontSize={9.5}
              fill="#7c8ba1"
            >
              load {load + 1}
            </text>
            {MACHINES.map((m, s2) => (
              <g key={m.label}>
                <rect
                  x={LABEL + (start + s2) * CW + 1.5}
                  y={y + 3}
                  width={CW - 3}
                  height={RH - 8}
                  rx={3}
                  fill={`${m.color}26`}
                  stroke={`${m.color}88`}
                  strokeWidth={1}
                />
                <text
                  x={LABEL + (start + s2) * CW + CW / 2}
                  y={y + RH / 2 + 2.5}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={7.5}
                  fill={m.color}
                >
                  {m.label}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {/* where the evening actually ends */}
      <line
        x1={LABEL + finish * CW}
        y1={10}
        x2={LABEL + finish * CW}
        y2={H - 14}
        stroke={finish < SPAN ? "#34d399" : "#fb7185"}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={LABEL + finish * CW - 4}
        y={H - 4}
        textAnchor="end"
        className="font-mono"
        fontSize={9}
        fill={finish < SPAN ? "#34d399" : "#fb7185"}
      >
        done · {finish} beats
      </text>
    </svg>
  );
}

export default function LaundryStory() {
  return (
    <section className="panel overflow-hidden">
      <header className="border-b border-edge px-4 py-3 sm:px-5">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
          THE ONE ANALOGY TO READ FIRST
        </h2>
        <p className="mt-0.5 text-[11.5px] text-dim">
          everything else on this page is a variation on this picture
        </p>
      </header>

      {/* ---------------------------------------------- the laundry story */}
      <div className="px-4 py-5 sm:px-5">
        <h3 className="text-[15px] font-semibold text-slate-100">
          Start here: the laundry that explains the whole page
        </h3>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
          You have one washer, one dryer, and one folding table, and three loads to do. Each machine
          takes the same time no matter what you do. Watch what changes when you stop being polite
          about it:
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-edge bg-panel-2 p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium text-slate-200">
                Politely, one load at a time
              </span>
              <span className="font-mono text-[10.5px] text-rose-300">9 beats</span>
            </div>
            <MiniGantt ii={3} finish={9} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
              The washer sits idle two thirds of the evening. This is your loop with{" "}
              <span className="font-mono text-slate-300">no pragma</span>.
            </p>
          </div>

          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/[0.04] p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium text-slate-200">
                Overlapped — a new load every beat
              </span>
              <span className="font-mono text-[10.5px] text-emerald-300">5 beats</span>
            </div>
            <MiniGantt ii={1} finish={5} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
              Same machines, same load times, nothing bought. This is{" "}
              <span className="font-mono text-slate-300">#pragma HLS PIPELINE II=1</span>.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-lg border border-edge bg-panel-2 p-4 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-cyan-300">WASH</div>
            <div className="mt-0.5 text-[12px] text-slate-400">
              = FETCH and LOAD — pulling the two numbers out of memory
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-wider text-amber-300">DRY</div>
            <div className="mt-0.5 text-[12px] text-slate-400">
              = MUL — the multiplier doing a × b
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-wider text-emerald-300">FOLD</div>
            <div className="mt-0.5 text-[12px] text-slate-400">
              = ACC — adding the answer onto the running total
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-slate-400">
          Notice what did <em>not</em> change: any single load still takes three beats from start to
          finish. That is <span className="text-slate-200">latency</span>, and pipelining barely
          touches it. What collapsed is how often a new load can start — and that is the number your
          users actually feel.
        </p>
      </div>

    </section>
  );
}
