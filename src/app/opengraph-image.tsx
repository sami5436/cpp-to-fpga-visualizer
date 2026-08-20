import { ImageResponse } from "next/og";

export const alt = "Silicon Trace — an interactive C++ to FPGA fabric walkthrough";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Link-preview card. Mirrors the app's palette from globals.css: ink background,
   cyan/violet/amber/emerald stage accents. ImageResponse only supports flexbox. */
export default function Image() {
  const stages: [string, string][] = [
    ["FETCH", "#22d3ee"],
    ["LOAD", "#a78bfa"],
    ["MUL", "#fbbf24"],
    ["ACC", "#34d399"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070d",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 22,
              letterSpacing: 6,
              color: "#22d3ee",
            }}
          >
            CYCLE-ACCURATE MODEL · XC7A35T-CLASS PART
          </div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, color: "#e2e8f0", marginTop: 20 }}>
            Silicon Trace
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#94a3b8",
              marginTop: 20,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Eight lines of C++, and the hardware they turn into.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {stages.map(([label, color], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: `2px solid ${color}`,
                  borderRadius: 12,
                  color,
                  fontSize: 26,
                  letterSpacing: 3,
                  padding: "14px 26px",
                }}
              >
                {label}
              </div>
              {i < stages.length - 1 ? (
                <div style={{ display: "flex", width: 44, height: 2, background: "#334155" }} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
