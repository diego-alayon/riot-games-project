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

/**
 * Riftbound key art behind heroes (Find Events, event detail). The comps use
 * Riot's card-collage artwork; until Riot supplies it (FND-04), a generated
 * collage stands in. Pass `image` to use the real asset. Colors are art data.
 */
export function KeyArt({ image, className }: { image?: string; className?: string }) {
  const cards: Array<[number, number, number, string]> = [
    // left %, top %, rotation deg, tint
    [-2, 8, -8, "rgb(120 90 60 / 0.55)"],
    [14, -18, 6, "rgb(60 110 150 / 0.55)"],
    [31, 22, -4, "rgb(150 70 140 / 0.5)"],
    [58, -24, 9, "rgb(70 120 200 / 0.5)"],
    [74, 18, -7, "rgb(160 60 110 / 0.55)"],
    [90, -10, 5, "rgb(90 70 150 / 0.55)"],
  ];
  return (
    <div className={cx("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, #2a1a3e 0%, #1b2a4a 45%, #3a1f45 100%)" }} />
          {cards.map(([l, t, r, tint], i) => (
            <div
              key={i}
              className="absolute w-[22%] min-w-40 aspect-[5/7] rounded-xl"
              style={{
                left: `${l}%`,
                top: `${t}%`,
                transform: `rotate(${r}deg)`,
                background: `linear-gradient(160deg, ${tint}, rgb(20 20 35 / 0.6))`,
                border: "2px solid rgb(255 255 255 / 0.12)",
              }}
            />
          ))}
          <div className="absolute inset-0" style={{ background: "radial-gradient(22% 45% at 55% 55%, rgb(210 235 255 / 0.55), transparent 70%)" }} />
        </>
      )}
      <div className="absolute inset-0 bg-linear-to-r from-surface-darker/80 via-surface-darker/45 to-surface-darker/20" />
    </div>
  );
}
