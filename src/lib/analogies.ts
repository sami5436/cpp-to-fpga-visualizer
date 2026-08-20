// ---------------------------------------------------------------------------
// Plain-English glossary. Every entry answers three questions in order:
// what is it really, what everyday thing is it like, and where on this page
// can I actually see it.
// ---------------------------------------------------------------------------

export type PanelKey =
  | "code"
  | "datapath"
  | "fabric"
  | "report"
  | "schedule"
  | "waveform"
  | "compare";

/** The one sentence that says what a panel is, before any jargon. */
export const PANEL_LEAD: Record<PanelKey, string> = {
  code: "The C++ you would actually write. A lit line means that piece of the circuit is switching right now.",
  datapath:
    "The kitchen this recipe turned into — pantry, counter, mixer, pot, serving hatch — wired together for good.",
  fabric:
    "Where each of those stations physically sits on the chip, and the roads laid between them.",
  report: "The bill: how much of the chip you spent, and how fast it is allowed to run.",
  schedule: "Who is working on what, beat by beat. The staircase shape is the entire trick.",
  waveform: "The same story drawn as wiggly lines — how hardware engineers actually read a chip.",
  compare: "Why go to all this trouble instead of just writing a for-loop on your laptop.",
};

export interface Analogy {
  term: string;
  panel: PanelKey;
  aka?: string;
  /** Literal, jargon-free definition. */
  plain: string;
  /** The everyday picture. */
  analogy: string;
  /** Which panel on this page shows it. */
  where: string;
  color: string;
}

export const ANALOGIES: Analogy[] = [
  {
    term: "FPGA",
    panel: "fabric",
    aka: "field-programmable gate array",
    plain:
      "A chip full of blank circuit parts and unconnected wires that you rearrange into whatever circuit you need.",
    analogy:
      "An empty industrial park with pre-built shells: plain workshops, a few cold-storage warehouses, a few heavy-machine halls. You lease the ones you need and lay the roads between them. Change your mind tomorrow and you re-lease different shells.",
    where: "the whole tile grid in Fabric Floorplan",
    color: "#22d3ee",
  },
  {
    term: "Bitstream",
    panel: "fabric",
    aka: "the .bit file",
    plain:
      "The file you load onto the chip. It is not a program the chip runs — it is the wiring diagram that rewires it.",
    analogy:
      "Not a recipe the kitchen follows. It is the blueprint for building the kitchen. Once it is loaded there is no software running at all: the circuit simply *is* the algorithm, in metal.",
    where: "the 'dot8.bit' step in the toolchain strip up top",
    color: "#a78bfa",
  },
  {
    term: "Clock cycle",
    panel: "waveform",
    aka: "clk, one tick",
    plain:
      "A shared heartbeat. Every part of the chip moves forward exactly one step on each beat, and nothing at all happens between beats.",
    analogy:
      "A rowing coxswain calling the stroke. Everyone pulls together on the call. One rower going faster on their own would just wreck the boat — so the whole chip waits for the beat.",
    where: "the 'clk' square wave at the top of the Waveform",
    color: "#94a3b8",
  },
  {
    term: "Register",
    panel: "datapath",
    aka: "flip-flop, FF",
    plain:
      "A one-item memory box that grabs whatever is on its input at the beat, and holds it steady until the next beat.",
    analogy:
      "The steel pass-through shelf between the kitchen and the waiters. The cook puts a plate down, and it stays put. Without it, the next cook's work would smear into the last one's.",
    where: "the small boxes labelled a_reg / ACC in the Datapath",
    color: "#a78bfa",
  },
  {
    term: "Pipeline",
    panel: "schedule",
    aka: "the whole point",
    plain:
      "Splitting work into stages so that several jobs can be in progress at once, each at a different stage.",
    analogy:
      "Laundry. Do a full load start-to-finish before touching the next and you waste the whole evening. Move load 1 into the dryer and immediately start load 2 in the washer, and you finish four loads in barely more time than one.",
    where: "the staircase in the Schedule chart",
    color: "#34d399",
  },
  {
    term: "Initiation interval",
    panel: "schedule",
    aka: "II",
    plain: "How many beats you must wait before you can start the next job.",
    analogy:
      "How often a new load goes into the washer. II=4 means you wait for the dryer and the folding to finish first. II=1 means a new load starts every single beat. This one number is the difference between a slow design and a fast one.",
    where: "press the four pragma buttons and watch the staircase tighten",
    color: "#fbbf24",
  },
  {
    term: "Latency vs throughput",
    panel: "report",
    aka: "the classic mix-up",
    plain:
      "Latency is how long ONE job takes end to end. Throughput is how many jobs finish per second. They are not the same number.",
    analogy:
      "A pizzeria. Latency is how long your pizza takes from order to doorstep — about 30 minutes, and a second oven will not change that. Throughput is how many pizzas leave per hour, and a second oven doubles it. Pipelining barely touches the first and transforms the second.",
    where: "TOTAL LATENCY and THROUGHPUT sit side by side in the report",
    color: "#22d3ee",
  },
  {
    term: "Unrolling",
    panel: "datapath",
    aka: "#pragma HLS UNROLL",
    plain:
      "Building several copies of the same circuit so you can chew through several elements on every single beat.",
    analogy:
      "Hiring four cooks and buying four stoves instead of one. Four orders progress at once — but the kitchen is only so big, and eventually you run out of floor.",
    where: "UNROLL 2 and 4 grow real extra multipliers in the Datapath",
    color: "#fbbf24",
  },
  {
    term: "LUT",
    panel: "fabric",
    aka: "lookup table, CLB, 'logic'",
    plain:
      "A tiny 6-input answer table. Fill in the answers you want and it behaves like whatever logic gate you needed.",
    analogy:
      "A cheat sheet taped to a wall: 'if the inputs are these, the answer is that.' Fill in enough cheat sheets and you can build literally any digital circuit out of them.",
    where: "the plain dark-blue tiles, and the LUT bar in the report",
    color: "#22d3ee",
  },
  {
    term: "Block RAM",
    panel: "datapath",
    aka: "BRAM",
    plain:
      "Small, very fast memory built right into the chip, next to the logic that uses it.",
    analogy:
      "The pantry shelf an arm's length from the stove. Tiny compared to the supermarket across town (that's external DRAM), but you can grab from it without breaking stride.",
    where: "BRAM_A and BRAM_B on the left of the Datapath",
    color: "#34d399",
  },
  {
    term: "DSP slice",
    panel: "datapath",
    aka: "DSP48, hard multiplier",
    plain:
      "A ready-made multiplier baked into the silicon. There are only a fixed number of them on any given chip.",
    analogy:
      "A commercial stand mixer that came with the building. You *could* whisk by hand with generic tools, but it would be slower and take up more counter space — so you use the mixers, and you count them carefully.",
    where: "the amber ⊗ circles, and the DSP48 bar (1 of 90)",
    color: "#fbbf24",
  },
  {
    term: "Critical path",
    panel: "report",
    aka: "Fmax, timing closure",
    plain:
      "The slowest stretch of logic between two registers. It alone decides how fast you are allowed to run the clock.",
    analogy:
      "A convoy moves at the speed of its slowest truck. It does not matter that four stations finish early — if one station needs 4 nanoseconds, nobody may beat the drum faster than that.",
    where: "TIMING (Fmax) in the report — it drops as the adder tree grows",
    color: "#fb7185",
  },
  {
    term: "HLS + pragmas",
    panel: "code",
    aka: "high-level synthesis",
    plain:
      "A compiler that turns C++ into a circuit instead of into instructions. Pragmas are hints telling it what shape of circuit you want.",
    analogy:
      "Handing a recipe to an architect instead of a chef. The architect does not cook it — they design a building that produces it. The pragmas are you saying 'I want four stoves' and 'keep the line moving'.",
    where: "line 10 of dot8.cpp changes with every button you press",
    color: "#a78bfa",
  },
  {
    term: "Determinism",
    panel: "compare",
    aka: "zero jitter",
    plain:
      "The circuit takes the exact same number of beats every single time it runs. Not on average — exactly.",
    analogy:
      "A busy shared kitchen sometimes leaves your order sitting while someone else's rush goes out; that is a CPU. A line built for your dish alone delivers at the same second on every order, forever. Boring is the entire point when you are steering a car or trading at a microsecond.",
    where: "the jitter column in 'Why bother? CPU vs fabric'",
    color: "#34d399",
  },
];
