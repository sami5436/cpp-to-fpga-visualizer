"use client";

import { useEffect, useMemo, useState } from "react";
import CodePanel from "@/components/CodePanel";
import ControlBar from "@/components/ControlBar";
import CpuCompare from "@/components/CpuCompare";
import Datapath from "@/components/Datapath";
import FabricGrid from "@/components/FabricGrid";
import LaundryStory from "@/components/LaundryStory";
import Narrator from "@/components/Narrator";
import PipelineChart from "@/components/PipelineChart";
import Primer from "@/components/Primer";
import SynthesisReport from "@/components/SynthesisReport";
import Waveform from "@/components/Waveform";
import {
  CLOCK_MHZ,
  ModeId,
  N,
  NS_PER_CYCLE,
  buildTrace,
  estimate,
  expectedResult,
  getMode,
} from "@/lib/sim";

const FLOW = [
  { k: "dot8.cpp", v: "C++ source" },
  { k: "vitis_hls", v: "schedule + bind" },
  { k: "dot8.v", v: "Verilog RTL" },
  { k: "place & route", v: "tiles + nets" },
  { k: "dot8.bit", v: "bitstream" },
  { k: "fabric", v: "running silicon" },
];

export default function Page() {
  const [modeId, setModeId] = useState<ModeId>("pipelined");
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(620);

  const mode = useMemo(() => getMode(modeId), [modeId]);
  const trace = useMemo(() => buildTrace(mode), [mode]);
  const est = useMemo(() => estimate(mode, trace), [mode, trace]);

  const maxCycle = trace.length - 1;
  const state = trace[Math.min(cycle, maxCycle)];

  // The clock generator. It free-runs and wraps, like a testbench on repeat.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCycle((c) => (c >= maxCycle ? 0 : c + 1));
    }, speed);
    return () => clearInterval(id);
  }, [running, speed, maxCycle]);

  // Switching pragmas re-synthesizes the kernel, so rewind the clock with it.
  const changeMode = (id: ModeId) => {
    setModeId(id);
    setCycle(0);
  };

  const expected = expectedResult();
  const pass = state.result !== null && state.result === expected;

  return (
    <main className="backdrop min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* ---------------------------------------------------------- hero */}
        <header className="mb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-cyan-400/80">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                CYCLE-ACCURATE MODEL · XC7A35T-CLASS PART
              </div>
              <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-100 sm:text-4xl">
                Silicon Trace
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400 sm:text-[13.5px]">
                Eight lines of C++, and the hardware they turn into. Press run and watch a single
                loop iteration travel through block RAM, a DSP slice and an accumulator — then
                change one pragma and watch the schedule, the floorplan and the resource report all
                change with it.
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
              <div className="rounded-lg border border-edge bg-panel px-3 py-2 sm:px-3.5">
                <div className="font-mono text-[9.5px] tracking-wider text-dim">RESULT</div>
                <div
                  className={`font-mono text-lg font-semibold ${
                    state.result !== null ? "text-emerald-300" : "text-slate-600"
                  }`}
                >
                  {state.result !== null ? state.result : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-edge bg-panel px-3 py-2 sm:px-3.5">
                <div className="font-mono text-[9.5px] tracking-wider text-dim">GOLDEN</div>
                <div className="font-mono text-lg font-semibold text-slate-300">{expected}</div>
              </div>
              <div
                className={`rounded-lg border px-3 py-2 transition-colors sm:px-3.5 ${
                  pass
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-edge bg-panel"
                }`}
              >
                <div className="font-mono text-[9.5px] tracking-wider text-dim">TESTBENCH</div>
                <div
                  className={`font-mono text-lg font-semibold ${
                    pass ? "text-emerald-300" : "text-slate-600"
                  }`}
                >
                  {pass ? "PASS" : "…"}
                </div>
              </div>
            </div>
          </div>

          {/* toolchain ribbon */}
          <div className="xscroll mt-5 flex items-center gap-1.5 rounded-lg border border-edge bg-panel/60 px-3 py-2">
            {FLOW.map((f, i) => (
              <div key={f.k} className="flex shrink-0 items-center gap-1.5">
                <div className="rounded px-2 py-1">
                  <div className="font-mono text-[11px] text-slate-300">{f.k}</div>
                  <div className="font-mono text-[9px] text-dim">{f.v}</div>
                </div>
                {i < FLOW.length - 1 && (
                  <span className="text-edge-hi" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
            <div className="relative ml-auto hidden h-px min-w-24 flex-1 overflow-hidden bg-edge lg:block">
              <div className="sweep h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
          </div>
        </header>

        {/* -------------------------------------------------------- primer */}
        <div className="mb-4 grid gap-3 sm:gap-4 xl:grid-cols-2">
          <Primer />
          <LaundryStory />
        </div>

        {/* ------------------------------------------------------ controls */}
        <ControlBar
          mode={mode}
          setMode={changeMode}
          running={running}
          setRunning={setRunning}
          cycle={cycle}
          setCycle={setCycle}
          maxCycle={maxCycle}
          speed={speed}
          setSpeed={setSpeed}
        />

        <div className="mt-3 sm:mt-4">
          <Narrator mode={mode} state={state} />
        </div>

        {/* --------------------------------------------------------- decks */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-4">
            <CodePanel mode={mode} state={state} />
          </div>
          <div className="min-w-0 xl:col-span-8">
            <Datapath mode={mode} state={state} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-7">
            <FabricGrid mode={mode} state={state} />
          </div>
          <div className="min-w-0 xl:col-span-5">
            <SynthesisReport mode={mode} est={est} />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <PipelineChart mode={mode} trace={trace} cycle={cycle} />
        </div>

        <div className="mt-3 sm:mt-4">
          <Waveform trace={trace} cycle={cycle} />
        </div>

        <div className="mt-3 sm:mt-4">
          <CpuCompare mode={mode} />
        </div>


        {/* -------------------------------------------------------- notes */}
        <section className="panel mt-3 p-4 sm:mt-4 sm:p-5">
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            THE ONE IDEA WORTH TAKING AWAY
          </h2>
          <div className="mt-3 grid gap-5 text-[13px] leading-relaxed text-slate-400 md:grid-cols-3">
            <p>
              <span className="text-slate-200">A CPU is borrowed time; an FPGA is owned space.</span>{" "}
              On a processor your loop is a queue of instructions taking turns at one fixed ALU. On
              fabric the loop <em>becomes</em> a circuit — the multiply and the add exist at
              physically different places on the die, so they can both be busy on the same clock
              edge with different iterations.
            </p>
            <p>
              <span className="text-slate-200">II is the number that matters.</span> Latency (how
              long one element takes end to end) barely moves when you pipeline — it is still four
              stages deep. What collapses is the initiation interval: how soon the <em>next</em>{" "}
              element can start. Flip between the pragmas above and watch the schedule chart, not
              the datapath.
            </p>
            <p>
              <span className="text-slate-200">You pay for parallelism in area.</span> Every unroll
              factor buys throughput with DSP slices, LUTs and routing. Fill the DSP bar and the
              only way forward is a bigger part. That trade — time for space — is the entire craft
              of hardware design, and it is why the resource report sits next to the waveform.
            </p>
          </div>

          <div className="mt-5 border-t border-edge pt-4 font-mono text-[10.5px] leading-relaxed text-slate-600">
            Model: {N}-tap int16 dot product · {CLOCK_MHZ} MHz ({NS_PER_CYCLE} ns/cycle) · 4-stage
            pipeline · resource and power figures are order-of-magnitude estimates for a small
            Artix-7-class part, not vendor tool output.
          </div>
        </section>
      </div>
    </main>
  );
}
