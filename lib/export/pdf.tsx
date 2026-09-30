/**
 * PDF export of the catalog: a cover with the epic index, then one section per
 * epic and, inside it, every functional requirement laid out like its drawer
 * (Roles, Requerimientos funcionales, Criterios de aceptación, Out of scope, Propiedades).
 */

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { PLATFORMS, PLATFORM_KEYS } from "@/lib/requirements/platforms";
import { epicTitle, formatDate, platformNames, type CatalogExport, type ExportEntry, type ExportRequirement } from "./catalog-export";

const INK = "#282a30";
const MUTED = "#6b6f76";
const FAINT = "#a0a4ab";
const LINE = "#e6e7ea";

const s = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 56, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.45, color: INK },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: FAINT },
  coverEyebrow: { fontSize: 10, color: MUTED, marginBottom: 6 },
  coverTitle: { fontWeight: 700, fontSize: 24, lineHeight: 1.2, marginBottom: 8 },
  coverMeta: { fontSize: 10, color: MUTED, marginBottom: 28 },
  indexRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: LINE },
  epicBand: { borderBottomWidth: 1.5, borderBottomColor: INK, paddingBottom: 6, marginBottom: 14 },
  epicCode: { fontSize: 9, color: MUTED },
  epicName: { fontWeight: 700, fontSize: 16, lineHeight: 1.3 },
  req: { marginBottom: 18, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: LINE },
  reqCode: { fontFamily: "Courier", fontSize: 8.5, color: MUTED },
  reqTitle: { fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 3 },
  description: { color: MUTED, marginBottom: 8 },
  sectionLabel: { fontWeight: 700, fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 8, marginBottom: 4 },
  platform: { fontWeight: 700, fontSize: 9, marginTop: 2, marginBottom: 2 },
  entry: { flexDirection: "row", marginBottom: 3 },
  entryId: { width: 66, fontFamily: "Courier", fontSize: 7.5, color: FAINT, paddingTop: 1.5 },
  entryText: { flex: 1 },
  table: { borderTopWidth: 0.5, borderTopColor: LINE },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 3 },
  th: { fontWeight: 700, fontSize: 8, color: MUTED },
  props: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  prop: { width: "33%", marginBottom: 3 },
  propLabel: { fontSize: 7.5, color: FAINT },
  empty: { color: FAINT },
});

const COLS = [{ w: "22%" }, { w: "48%" }, { w: "30%" }];

function Entries({ list }: { list: ExportEntry[] }) {
  return (
    <>
      {list.map(e => (
        <View key={e.id} style={s.entry} wrap={false}>
          <Text style={s.entryId}>{e.id}</Text>
          <Text style={s.entryText}>{e.text}</Text>
        </View>
      ))}
    </>
  );
}

function Requirement({ r }: { r: ExportRequirement }) {
  const platforms = PLATFORM_KEYS.filter(p => r.functional[p].length > 0);
  const props: [string, string][] = [
    ["Estado", r.status ?? ""],
    ["Prioridad", r.priority ?? ""],
    ["Plataforma", platformNames(r.platforms)],
    ["Fecha de entrega", formatDate(r.dueDate)],
    ["Página", r.page ?? ""],
  ];
  return (
    <View style={s.req}>
      <View minPresenceAhead={60}>
        <Text style={s.reqCode}>{r.code}</Text>
        <Text style={s.reqTitle}>{r.feature}</Text>
        {r.description ? <Text style={s.description}>{r.description}</Text> : null}
      </View>

      {r.roles.length > 0 && (
        <>
          <Text style={s.sectionLabel}>Roles</Text>
          <View style={s.table}>
            <View style={s.tr}>
              {["Rol", "Funcionalidad soportada", "Precondición"].map((h, i) => <Text key={h} style={[s.th, { width: COLS[i].w }]}>{h}</Text>)}
            </View>
            {r.roles.map((ro, i) => (
              <View key={i} style={s.tr} wrap={false}>
                <Text style={{ width: COLS[0].w }}>{ro.role}</Text>
                <Text style={{ width: COLS[1].w }}>{ro.capability}</Text>
                <Text style={{ width: COLS[2].w }}>{ro.precondition ?? ""}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={s.sectionLabel}>Requerimientos funcionales</Text>
      {platforms.length === 0 && <Text style={s.empty}>Sin requerimientos funcionales todavía.</Text>}
      {platforms.map(p => (
        <View key={p}>
          <Text style={s.platform}>{PLATFORMS[p]}</Text>
          <Entries list={r.functional[p]} />
        </View>
      ))}

      <Text style={s.sectionLabel}>Criterios de aceptación</Text>
      {r.acceptance.length === 0 ? <Text style={s.empty}>Sin criterios de aceptación todavía.</Text> : <Entries list={r.acceptance} />}

      {r.outOfScope.length > 0 && (
        <>
          <Text style={s.sectionLabel}>Out of scope</Text>
          <Entries list={r.outOfScope} />
        </>
      )}

      <Text style={s.sectionLabel}>Propiedades</Text>
      <View style={s.props}>
        {props.map(([label, value]) => (
          <View key={label} style={s.prop}>
            <Text style={s.propLabel}>{label}</Text>
            <Text>{value || "—"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CatalogPdf({ doc }: { doc: CatalogExport }) {
  const date = formatDate(doc.generatedAt.toISOString());
  return (
    <Document title={doc.title} author="Riot Games Project">
      {doc.initiatives.map(init => {
        const total = init.epics.reduce((n, e) => n + e.requirements.length, 0);
        return [
          <Page key={`${init.name}-cover`} size="A4" style={s.page}>
            <Text style={s.coverEyebrow}>{init.name}</Text>
            <Text style={s.coverTitle}>{doc.title}</Text>
            <Text style={s.coverMeta}>Generado el {date} · {init.epics.length} épicas · {total} requerimientos</Text>
            {init.epics.map(e => (
              <View key={epicTitle(e)} style={s.indexRow}>
                <Text>{epicTitle(e)}</Text>
                <Text style={{ color: MUTED }}>{e.requirements.length}</Text>
              </View>
            ))}
            <Footer name={init.name} title={doc.title} />
          </Page>,
          ...init.epics.map(epic => (
            <Page key={`${init.name}-${epicTitle(epic)}`} size="A4" style={s.page} wrap>
              <View style={s.epicBand}>
                {epic.code ? <Text style={s.epicCode}>{epic.code}</Text> : null}
                <Text style={s.epicName}>{epic.name}</Text>
              </View>
              {epic.requirements.map(r => <Requirement key={r.code} r={r} />)}
              <Footer name={init.name} title={doc.title} />
            </Page>
          )),
        ];
      })}
    </Document>
  );
}

function Footer({ name, title }: { name: string; title: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{name} · {title}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export const catalogToPdf = (doc: CatalogExport): Promise<Buffer> => renderToBuffer(<CatalogPdf doc={doc} />);
