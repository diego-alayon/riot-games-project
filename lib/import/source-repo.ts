/**
 * Read-only access to BMAD planning artifacts sitting in other local repos.
 *
 * The browser cannot reach these paths, so the server reads them. Because the
 * path arrives from the client, every request is confined to an allow-listed
 * root: the real (symlink-resolved) path must stay inside a root and must be a
 * markdown file. Nothing here ever writes.
 */

import { promises as fs } from "fs";
import path from "path";

export const ARTIFACT_KINDS = ["prd", "architecture", "epics"] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

/** Where each artifact sits inside an initiative folder. */
const ARTIFACT_FILE: Record<ArtifactKind, string> = {
  prd: "prd.md",
  architecture: "architecture.md",
  epics: "epics.md",
};

/**
 * Allow-listed repository roots, newline/comma separated in BMAD_SOURCE_ROOTS.
 * Defaults to the OneVenue platform repo checked out beside this project.
 */
export function sourceRoots(): string[] {
  const configured = process.env.BMAD_SOURCE_ROOTS;
  const raw = configured
    ? configured.split(/[,\n]/)
    : [path.resolve(process.cwd(), "..", "sv_global-onevenue-platform")];
  return raw.map(s => s.trim()).filter(Boolean).map(p => path.resolve(p));
}

/** The planning-artifacts directory inside a repo root. */
export function planningDir(root: string): string {
  return path.join(root, "_bmad-output", "planning-artifacts");
}

export class SourcePathError extends Error {}

/**
 * Resolves a client-supplied path to a real file inside an allow-listed root.
 * Throws SourcePathError for anything outside, non-markdown, or missing.
 */
export async function resolveSourceFile(input: string): Promise<string> {
  if (!input || typeof input !== "string") {
    throw new SourcePathError("A file path is required.");
  }

  const roots = sourceRoots();
  // A relative path is resolved against each root in turn; absolute is taken as-is.
  const candidates = path.isAbsolute(input)
    ? [path.resolve(input)]
    : roots.map(r => path.resolve(r, input));

  for (const candidate of candidates) {
    let real: string;
    try {
      real = await fs.realpath(candidate);
    } catch {
      continue;
    }

    const insideRoot = roots.some(root => real === root || real.startsWith(root + path.sep));
    if (!insideRoot) {
      throw new SourcePathError(
        `Path is outside the allowed source roots. Allowed: ${roots.join(", ")}`,
      );
    }
    if (path.extname(real).toLowerCase() !== ".md") {
      throw new SourcePathError("Only .md artifacts can be read.");
    }

    const stat = await fs.stat(real);
    if (!stat.isFile()) throw new SourcePathError("Path is not a file.");

    return real;
  }

  throw new SourcePathError(`File not found: ${input}`);
}

export async function readSourceFile(input: string): Promise<{ path: string; content: string }> {
  const real = await resolveSourceFile(input);
  return { path: real, content: await fs.readFile(real, "utf8") };
}

export interface InitiativeFolder {
  /** Folder name, e.g. "05-RiftboundTicketingPortal". */
  name: string;
  /** Path relative to the repo root, for display and for re-reading. */
  relPath: string;
  root: string;
  /** Which of the three artifacts exist, with their relative paths. */
  artifacts: Partial<Record<ArtifactKind, string>>;
}

/**
 * Lists initiative folders under every allow-listed root, reporting which of
 * the three artifacts each one currently has.
 */
export async function listInitiativeFolders(): Promise<InitiativeFolder[]> {
  const out: InitiativeFolder[] = [];

  for (const root of sourceRoots()) {
    const dir = planningDir(root);
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folder = path.join(dir, entry.name);
      const artifacts: Partial<Record<ArtifactKind, string>> = {};

      for (const kind of ARTIFACT_KINDS) {
        const file = path.join(folder, ARTIFACT_FILE[kind]);
        try {
          const stat = await fs.stat(file);
          if (stat.isFile()) artifacts[kind] = path.relative(root, file);
        } catch {
          // artifact not produced yet
        }
      }

      if (Object.keys(artifacts).length === 0) continue;

      out.push({
        name: entry.name,
        relPath: path.relative(root, folder),
        root,
        artifacts,
      });
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}
