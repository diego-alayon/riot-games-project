import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Screens of each application that implement a requirement, from the app's own
 * traceability manifest. Today only Riftbound Ticketing ships one
 * (riftbound-ticketing/traceability.json).
 */
const MANIFESTS = [{ app: "riftbound", file: path.join(process.cwd(), "riftbound-ticketing", "traceability.json") }];

interface ManifestScreen { id: string; name: string; route: string; requirements: string[] }

export async function GET() {
  const screens: Array<Omit<ManifestScreen, "requirements"> & { app: string; requirements: string[] }> = [];
  for (const m of MANIFESTS) {
    try {
      const doc = JSON.parse(await fs.readFile(m.file, "utf8")) as { screens?: ManifestScreen[] };
      for (const s of doc.screens ?? []) screens.push({ ...s, app: m.app });
    } catch {
      // Manifest missing or unreadable: the app simply contributes no screens.
    }
  }
  return NextResponse.json({ screens });
}
