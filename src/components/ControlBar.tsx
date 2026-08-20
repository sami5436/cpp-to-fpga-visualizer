"use client";

import { MODES, ModeConfig, ModeId } from "@/lib/sim";

function Btn({
  onClick,
  children,
  title,
  primary,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={[
        "flex h-9 items-center justify-center rounded-md border px-3 font-mono text-[12px] transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-35",
        primary
          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200 hover:enabled:bg-cyan-400/25"
          : "border-edge bg-panel-2 text-slate-400 hover:enabled:border-edge-hi hover:enabled:text-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function ControlBar({
  mode,
  setMode,
  running,
  setRunning,
  cycle,
  setCycle,
  maxCycle,
  speed,
  setSpeed,
}: {
  mode: ModeConfig;
  setMode: (id: ModeId) => void;
  running: boolean;
  setRunning: (v: boolean) => void;
  cycle: number;
  setCycle: (c: number) => void;
  maxCycle: number;
  speed: number;
  setSpeed: (v: number) => void;
}) {
  return (
    <div className="panel flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:gap-4">
      {/* transport */}
      <div className="flex items-center gap-1.5">
        <Btn
          title="Reset to cycle 0"
          onClick={() => {
            setRunning(false);
            setCycle(0);
          }}
        >
          ⟲
        </Btn>
        <Btn title="Step back one cycle" onClick={() => setCycle(Math.max(0, cycle - 1))} disabled={cycle === 0}>
          ◀
        </Btn>
        <Btn primary title={running ? "Pause the clock" : "Run the clock"} onClick={() => setRunning(!running)}>
          {running ? "❙❙ pause" : "▶ run"}
        </Btn>
        <Btn
          title="Step forward one cycle"
          onClick={() => setCycle(Math.min(maxCycle, cycle + 1))}
          disabled={cycle === maxCycle}
        >
          ▶❙
        </Btn>
      </div>

      {/* scrubber */}
      <div className="flex flex-1 items-center gap-3">
        <span className="w-24 shrink-0 font-mono text-[11px] text-dim">
          cycle{" "}
          <span className="text-cyan-300">
            {String(cycle).padStart(2, "0")}
          </span>
          /{maxCycle}
        </span>
        <input
          type="range"
          min={0}
          max={maxCycle}
          value={cycle}
          onChange={(e) => {
            setRunning(false);
            setCycle(Number(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-edge accent-cyan-400"
          aria-label="Clock cycle"
        />
      </div>

      {/* clock speed */}
      <label className="flex items-center gap-2 font-mono text-[11px] text-dim">
        <span className="whitespace-nowrap">clk rate</span>
        <input
          type="range"
          min={60}
          max={1200}
          step={20}
          value={1260 - speed}
          onChange={(e) => setSpeed(1260 - Number(e.target.value))}
          className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-edge accent-violet-400"
          aria-label="Simulation speed"
        />
      </label>

      {/* pragma / schedule selector */}
      <div className="flex flex-wrap items-center gap-1.5">
        {MODES.map((m) => {
          const on = m.id === mode.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={[
                "rounded-md border px-2.5 py-1.5 text-left transition-colors",
                on
                  ? "border-amber-400/50 bg-amber-400/12"
                  : "border-edge bg-panel-2 hover:border-edge-hi",
              ].join(" ")}
            >
              <span
                className={`block font-mono text-[11px] ${on ? "text-amber-200" : "text-slate-400"}`}
              >
                {m.label}
              </span>
              <span className="block font-mono text-[9.5px] text-dim">{m.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
