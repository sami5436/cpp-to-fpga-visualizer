"use client";

const STEPS = [
  {
    n: "1",
    title: "The C++ is not running",
    body: "Nothing executes it line by line. A compiler read it once and built a circuit shaped like it. The lit lines just show which piece of that circuit is switching right now.",
    color: "#22d3ee",
  },
  {
    n: "2",
    title: "Several lines light at once",
    body: "That is not the code jumping ahead. Line 12 is working on element 3 while line 14 works on element 1 — different elements, in different places on the chip, at the same instant.",
    color: "#a78bfa",
  },
  {
    n: "3",
    title: "The buttons rebuild the hardware",
    body: "Press a different pragma and you are not changing a setting. You are asking for a physically different circuit — more multipliers, different wiring, a different floorplan.",
    color: "#fbbf24",
  },
];

export default function Primer() {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-edge px-4 py-3 sm:px-5">
        <h2 className="text-[13px] font-semibold text-slate-100">
          New to hardware? Three things, then it all makes sense
        </h2>
        <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-400">
          A CPU is one extremely fast chef working a recipe step by step with one cutting board. An
          FPGA is an empty kitchen where you{" "}
          <span className="text-slate-200">build a station for every step</span> — chopping, frying,
          plating — and every station works at the same time on a different order. That single
          difference explains everything below.
        </p>
        <p className="mt-2.5 font-mono text-[11px] text-cyan-400/80">
          every panel below has a 💡 strip — open it for the jargon in that panel
        </p>
      </div>

      <div className="grid gap-px bg-edge sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-panel px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold"
                style={{ background: `${s.color}22`, color: s.color }}
              >
                {s.n}
              </span>
              <h3 className="text-[12.5px] font-medium text-slate-200">{s.title}</h3>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
