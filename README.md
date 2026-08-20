# cpp-to-fpga-visualizer

An interactive, cycle-accurate walkthrough of how a C++ kernel becomes a pipelined
datapath on FPGA fabric — written for people who have never touched hardware.

An 8-tap `int16` dot product is modelled as a 4-stage pipeline. Every panel renders
from **one shared trace**, so the code highlighting, schematic, floorplan, schedule
and waveform can never disagree with each other.

## The idea

A CPU is one very fast chef working a recipe step by step with one cutting board.
An FPGA is an empty kitchen where you *build a station for every step* — and every
station works at the same time on a different order.

Press run and watch one loop iteration travel `FETCH → LOAD → MUL → ACC`. Then
change a single pragma and watch the schedule, the floorplan and the resource
report all change with it.

| Pragma | II | Lanes | Latency |
| --- | --- | --- | --- |
| none | 4 | 1 | 33 cycles |
| `PIPELINE II=1` | 1 | 1 | 12 cycles |
| `+ UNROLL 2` | 1 | 2 | 8 cycles |
| `+ UNROLL 4` | 1 | 4 | 6 cycles |

## Panels

- **Narrator** — live plain-English commentary of the current clock cycle. At II=1
  it reads *"4 stations are busy at once, each on a different pair of numbers."*
- **dot8.cpp** — source lines lit in the colour of the stage whose silicon is
  switching this cycle. Several light up at once, each on a different element.
- **Synthesized datapath** — SVG schematic with Manhattan-routed nets, animated
  current flow, and live register values. Unrolling grows real lanes and an adder tree.
- **Fabric floorplan** — a 30×14 tile die (CLB / BRAM / DSP48 / IOB columns) showing
  where each module lands and which nets carry data this cycle.
- **Schedule** — the iteration/cycle Gantt that makes initiation interval obvious,
  with a scalar-CPU instruction row underneath for contrast.
- **Waveform** — VCD-style bus and bit traces, the way a testbench would dump them.
- **Synthesis report / CPU comparison** — resource budget against an Artix-7-class
  part, and an honest look at where fabric actually wins.

Every panel carries a 💡 strip explaining, in plain language, what it shows and
what the jargon in it means.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4. No runtime dependencies
beyond React — all graphics are hand-written inline SVG.

## Honesty notes

- Resource, power and Fmax figures are **order-of-magnitude estimates** for a small
  Artix-7-class part, not vendor tool output.
- The pipeline model is idealized: no BRAM port contention, no memory stalls. Fair
  for a kernel this small; it would not hold for a real streaming design.
- The CPU comparison does **not** claim the FPGA wins on raw throughput — a
  well-vectorized AVX2 CPU beats this build, and the page says so. The honest wins
  are MACs per joule and a latency that is the same integer cycle count every run.

## Verifying the model

The trace is checked rather than eyeballed: all four schedules produce the correct
result (143), every element is fetched exactly once, no two iterations ever collide
in a stage, and observed latency matches `1 + (groups−1)·II + 4` exactly.
