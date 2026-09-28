import { saleLabel } from "@/lib/data/selectors";
import type { RiftEvent } from "@/lib/data/types";

export { dayHeading } from "@/lib/format";

export function saleLabelFor(ev: RiftEvent): string {
  const s = saleLabel(ev);
  return s.live ? "Passes are on sale now." : `Passes: ${s.text.toLowerCase()}.`;
}
