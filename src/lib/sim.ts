// ---------------------------------------------------------------------------
// A tiny cycle-accurate model of an HLS-synthesized dot-product accelerator.
// Everything the UI draws (datapath, waveform, fabric, source highlighting)
// is derived from the trace this file produces, so the panels can never
// disagree with each other.
// ---------------------------------------------------------------------------

export const N = 8;
export const VEC_A = [3, -1, 4, 1, 5, 9, 2, 6];
export const VEC_B = [2, 7, 1, 8, 2, 8, 1, 8];

export const CLOCK_MHZ = 200;
export const NS_PER_CYCLE = 1000 / CLOCK_MHZ;

export type ModeId = "sequential" | "pipelined" | "unroll2" | "unroll4";

export interface ModeConfig {
  id: ModeId;
  label: string;
  short: string;
  /** Pragma lines injected into the loop body, in source order. */
  pragmas: string[];
  /** Initiation interval: cycles between successive loop launches. */
  ii: number;
  /** How many elements are processed per launch (unroll factor). */
  lanes: number;
  blurb: string;
}

export const MODES: ModeConfig[] = [
  {
    id: "sequential",
    label: "No pragma",
    short: "II=4 · 1 lane",
    pragmas: [],
    ii: 4,
    lanes: 1,
    blurb:
      "The scheduler serializes the loop: one iteration must fully drain before the next is launched. The multiplier idles 3 of every 4 cycles.",
  },
  {
    id: "pipelined",
    label: "PIPELINE II=1",
    short: "II=1 · 1 lane",
    pragmas: ["#pragma HLS PIPELINE II=1"],
    ii: 1,
    lanes: 1,
    blurb:
      "One launch per cycle. Four iterations are in flight at once — every stage of the datapath does useful work on every clock edge.",
  },
  {
    id: "unroll2",
    label: "PIPELINE + UNROLL 2",
    short: "II=1 · 2 lanes",
    pragmas: ["#pragma HLS PIPELINE II=1", "#pragma HLS UNROLL factor=2"],
    ii: 1,
    lanes: 2,
    blurb:
      "The loop body is replicated. Two DSP slices multiply in parallel and an adder tree folds their products before the accumulator.",
  },
  {
    id: "unroll4",
    label: "PIPELINE + UNROLL 4",
    short: "II=1 · 4 lanes",
    pragmas: ["#pragma HLS PIPELINE II=1", "#pragma HLS UNROLL factor=4"],
    ii: 1,
    lanes: 4,
    blurb:
      "Four spatial lanes. The BRAM ports widen to 64 bits, four DSPs fire per cycle, and the whole 8-tap dot product retires in 7 cycles.",
  },
];

export function getMode(id: ModeId): ModeConfig {
  return MODES.find((m) => m.id === id) ?? MODES[1];
}

// --- pipeline shape ---------------------------------------------------------

export const PIPE_DEPTH = 4;

export interface StageDef {
  id: string;
  label: string;
  sub: string;
  /** The same step, said the way you'd say it in a kitchen. */
  analogy: string;
  /** Live narration template; {i} {a} {b} {p} are filled in per cycle. */
  narrate: string;
  /** Tailwind-ready hex used consistently across every panel. */
  color: string;
}

export const STAGES: StageDef[] = [
  {
    id: "fetch",
    label: "FETCH",
    sub: "i → BRAM addr",
    analogy: "calling out an order number so the pantry knows what to go get",
    narrate: "shouting for pair {i}",
    color: "#22d3ee",
  },
  {
    id: "load",
    label: "LOAD",
    sub: "BRAM → regs",
    analogy: "the pantry sliding the two ingredients across the counter",
    narrate: "pair {i} lands on the counter — {a} and {b}",
    color: "#a78bfa",
  },
  {
    id: "mul",
    label: "MUL",
    sub: "DSP48 a×b",
    analogy: "the stand mixer combining those two ingredients into one",
    narrate: "the mixer works pair {i}: {a} × {b} = {p}",
    color: "#fbbf24",
  },
  {
    id: "acc",
    label: "ACC",
    sub: "acc += p",
    analogy: "tipping that result into the pot that has been simmering all along",
    narrate: "pair {i}'s {p} goes into the pot",
    color: "#34d399",
  },
];

/** One launch group travelling down the pipeline. */
export interface Token {
  gid: number;
  stage: number;
  idx: number[];
  a: number[];
  b: number[];
  prod: number[];
  sum: number;
}

/** Fill a stage's narration template from the token sitting in that stage. */
export function narrate(stage: number, t: Token): string {
  const many = t.idx.length > 1;
  return STAGES[stage].narrate
    .replace("{i}", many ? `${t.idx[0]}\u2013${t.idx[t.idx.length - 1]}` : String(t.idx[0]))
    .replace("{a}", many ? t.a.join(", ") : String(t.a[0]))
    .replace("{b}", many ? t.b.join(", ") : String(t.b[0]))
    .replace("{p}", many ? String(t.sum) : String(t.prod[0]));
}

export interface CycleState {
  cycle: number;
  reset: boolean;
  tokens: Token[];
  /** tokens indexed by stage, for panels that want O(1) lookup */
  byStage: (Token | undefined)[];
  acc: number;
  addr: number | null;
  outValid: boolean;
  result: number | null;
  retired: number;
}

interface Group {
  gid: number;
  launch: number;
  idx: number[];
  a: number[];
  b: number[];
  prod: number[];
  sum: number;
}

function buildGroups(mode: ModeConfig): Group[] {
  const groups: Group[] = [];
  const count = Math.ceil(N / mode.lanes);
  for (let g = 0; g < count; g++) {
    const idx: number[] = [];
    for (let l = 0; l < mode.lanes; l++) {
      const i = g * mode.lanes + l;
      if (i < N) idx.push(i);
    }
    const a = idx.map((i) => VEC_A[i]);
    const b = idx.map((i) => VEC_B[i]);
    const prod = idx.map((_, k) => a[k] * b[k]);
    groups.push({
      gid: g,
      launch: 1 + g * mode.ii, // cycle 0 is reset
      idx,
      a,
      b,
      prod,
      sum: prod.reduce((s, p) => s + p, 0),
    });
  }
  return groups;
}

export function buildTrace(mode: ModeConfig): CycleState[] {
  const groups = buildGroups(mode);
  const last = groups[groups.length - 1];
  const doneCycle = last.launch + PIPE_DEPTH; // acc register holds the final sum
  const total = doneCycle + 2;

  const trace: CycleState[] = [];
  for (let c = 0; c <= total; c++) {
    const tokens: Token[] = [];
    const byStage: (Token | undefined)[] = new Array(PIPE_DEPTH).fill(undefined);

    for (const g of groups) {
      const stage = c - g.launch;
      if (stage < 0 || stage >= PIPE_DEPTH) continue;
      const t: Token = { gid: g.gid, stage, idx: g.idx, a: g.a, b: g.b, prod: g.prod, sum: g.sum };
      tokens.push(t);
      byStage[stage] = t;
    }

    // The ACC register commits at the end of stage 3, so it is readable one
    // cycle later — that single line is the whole reason the pipeline works.
    const retiredGroups = groups.filter((g) => g.launch + PIPE_DEPTH <= c);
    const acc = retiredGroups.reduce((s, g) => s + g.sum, 0);
    const retired = retiredGroups.reduce((s, g) => s + g.idx.length, 0);

    const fetching = byStage[0];
    trace.push({
      cycle: c,
      reset: c === 0,
      tokens,
      byStage,
      acc,
      addr: fetching ? fetching.idx[0] : null,
      outValid: c === doneCycle,
      result: c >= doneCycle ? acc : null,
      retired,
    });
  }
  return trace;
}

export function expectedResult(): number {
  return VEC_A.reduce((s, a, i) => s + a * VEC_B[i], 0);
}

// --- synthesis estimates ----------------------------------------------------

export interface Estimate {
  dsp: number;
  bram: number;
  lut: number;
  ff: number;
  latency: number;
  ii: number;
  fmax: number;
}

export function estimate(mode: ModeConfig, trace: CycleState[]): Estimate {
  const lanes = mode.lanes;
  const adderTree = Math.max(0, lanes - 1);
  return {
    dsp: lanes,
    bram: 2,
    lut: 168 + lanes * 96 + adderTree * 48 + (mode.ii === 1 ? 124 : 32),
    ff: 96 + lanes * 64 + PIPE_DEPTH * 24 + (mode.ii === 1 ? 88 : 0),
    latency: trace.length - 1,
    ii: mode.ii,
    // Wider adder trees eat into timing closure a little.
    fmax: Math.round(CLOCK_MHZ + 62 - adderTree * 9),
  };
}

// --- the C++ the user is "compiling" ---------------------------------------

export interface SourceLine {
  n: number;
  text: string;
  /** Index into STAGES this line maps to once synthesized, if any. */
  stage?: number;
  /** true for the writeback line, lit when the result is valid */
  writeback?: boolean;
  pragma?: boolean;
}

export function sourceFor(mode: ModeConfig): SourceLine[] {
  const head: string[] = [
    "#include <cstdint>",
    "",
    "// 8-tap dot product → custom datapath",
    "void dot8(const int16_t a[8],",
    "          const int16_t b[8],",
    "          int32_t *out) {",
    "  int32_t acc = 0;",
    "",
    "  for (int i = 0; i < 8; i++) {",
  ];

  // the induction variable *is* the address generator, so the for-line is FETCH
  const lines: SourceLine[] = head.map((text, k) => ({
    n: k + 1,
    text,
    stage: text.startsWith("  for (") ? 0 : undefined,
  }));
  let n = lines.length;

  for (const p of mode.pragmas) {
    lines.push({ n: ++n, text: "    " + p, pragma: true });
  }

  const body: [string, number | undefined, boolean?][] = [
    ["    int16_t va = a[i];", 1],
    ["    int16_t vb = b[i];", 1],
    ["    int32_t p  = va * vb;", 2],
    ["    acc += p;", 3],
    ["  }", undefined],
    ["", undefined],
    ["  *out = acc;", undefined, true],
    ["}", undefined],
  ];
  for (const [text, stage, writeback] of body) {
    lines.push({ n: ++n, text, stage, writeback });
  }
  return lines;
}

/** The FETCH stage drives the address for the two load lines. */
export const FETCH_LINE_STAGE = 0;

// --- formatting helpers -----------------------------------------------------

export function hex(value: number, nibbles: number): string {
  const mask = nibbles >= 8 ? 0xffffffff : (1 << (nibbles * 4)) - 1;
  const raw = (value & mask) >>> 0;
  return raw.toString(16).toUpperCase().padStart(nibbles, "0");
}
