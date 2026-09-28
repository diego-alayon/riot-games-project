import { cx } from "@/lib/cx";

export interface EventArtwork {
  /** Real image supplied by Riot (FND-04). When absent, a generated placeholder is drawn. */
  image?: string;
  from: string;
  to: string;
  glow?: string;
  city: string;
  showMark?: boolean;
}

/**
 * Event key art. Fills its (relative) parent. Placeholder composition mirrors the
 * comps: two-stop gradient, a radial glow, a ring mark and the faded
 * "REGIONAL QUALIFIER" lockup. Colors here are art data, not UI tokens.
 */
export function EventArt({
  art,
  overlay = "none",
  markScale = 1,
  markTop = 50,
  className,
}: {
  art: EventArtwork;
  overlay?: "none" | "bottom" | "left" | "full";
  markScale?: number;
  /** Vertical position of the lockup, % from top. */
  markTop?: number;
  className?: string;
}) {
  return (
    <div className={cx("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {art.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${art.from}, ${art.to})` }} />
          {art.glow && (
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(60% 80% at 70% 35%, ${art.glow}, transparent 70%)` }}
            />
          )}
          {art.showMark !== false && (
            <div
              className="absolute left-1/2 flex flex-col items-center"
              style={{ top: `${markTop}%`, transform: `translate(-50%, -50%) scale(${markScale})` }}
            >
              <div
                className="size-28 rounded-full"
                style={{ border: "14px solid rgb(214 128 40 / 0.75)", borderRightColor: "transparent", transform: "rotate(-30deg)" }}
              />
              <div
                className="mt-3 text-center font-serif leading-[0.9] tracking-wide"
                style={{ color: "rgb(255 255 255 / 0.42)", fontSize: 54, fontWeight: 700 }}
              >
                REGIONAL
                <br />
                QUALIFIER
              </div>
              <div className="mt-1 font-serif tracking-[0.2em]" style={{ color: "rgb(214 128 40 / 0.6)", fontSize: 18, fontWeight: 700 }}>
                {art.city.toUpperCase()}
              </div>
            </div>
          )}
        </>
      )}
      {overlay === "bottom" && (
        <div className="absolute inset-0 bg-linear-to-t from-surface-darker/85 via-surface-darker/20 to-transparent" />
      )}
      {overlay === "left" && <div className="absolute inset-0 bg-linear-to-r from-surface-dark via-surface-dark/85 to-surface-dark/10" />}
      {overlay === "full" && <div className="absolute inset-0 bg-surface-darker/45" />}
    </div>
  );
}

/**
 * Deterministic QR-style matrix derived from the badge code.
 * Visual placeholder only — the scannable token comes from the platform (MYT-03).
 */
export function QRCode({ value, size = 104, className }: { value: string; size?: number; className?: string }) {
  const n = 25;
  let seed = 0;
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 1000) / 1000;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y]);
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} fill="currentColor" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="white" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="currentColor" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" className={cx("text-surface-darker", className)} role="img" aria-label={`QR code ${value}`}>
      <rect width={n} height={n} fill="white" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
