import type { NextRequest } from "next/server";
import { buildCatalogExport, exportFileStem } from "@/lib/export/catalog-export";
import { catalogToXlsx } from "@/lib/export/xlsx";
import { catalogToPdf } from "@/lib/export/pdf";

const FORMATS = {
  xlsx: { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", render: catalogToXlsx },
  pdf: { type: "application/pdf", render: catalogToPdf },
} as const;

/** GET /api/catalog/export?format=xlsx|pdf — the whole catalog as a file download. */
export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "xlsx";
  if (!(format in FORMATS)) return new Response("format must be xlsx or pdf", { status: 400 });
  const { type, render } = FORMATS[format as keyof typeof FORMATS];

  const doc = buildCatalogExport();
  const body = await render(doc);
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${exportFileStem(doc)}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}
