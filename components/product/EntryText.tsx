/**
 * Text of a drawer entry. Plain text keeps its line breaks; consecutive lines
 * written as a Markdown table ("| a | b |", with an optional "|---|" separator)
 * are drawn as a table, so a comment can carry a small comparison (e.g. CHK-10.C1).
 */

import { Fragment } from "react";
import { TXT_2 } from "./RequirementCells";

const isRow = (line: string) => /^\s*\|.*\|\s*$/.test(line);
const isSeparator = (line: string) => /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());

type Block = { kind: "text"; lines: string[] } | { kind: "table"; rows: string[][] };

function blocks(text: string): Block[] {
  const out: Block[] = [];
  for (const line of text.split("\n")) {
    const last = out[out.length - 1];
    if (isRow(line)) {
      if (isSeparator(line)) continue;
      if (last?.kind === "table") last.rows.push(cells(line));
      else out.push({ kind: "table", rows: [cells(line)] });
    } else if (last?.kind === "text") last.lines.push(line);
    else out.push({ kind: "text", lines: [line] });
  }
  return out;
}

export const hasTable = (text: string) => text.split("\n").filter(isRow).length >= 2;

export function EntryText({ text }: { text: string }) {
  if (!hasTable(text)) return <>{text}</>;
  return (
    <>
      {blocks(text).map((b, i) =>
        b.kind === "text" ? (
          <span key={i} style={{ display: "block", whiteSpace: "pre-wrap" }}>{b.lines.join("\n")}</span>
        ) : (
          <span key={i} style={{ display: "block", overflowX: "auto", margin: "8px 0" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12.5, lineHeight: 1.4, width: "max-content" }}>
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r} style={{ borderBottom: "1px solid #ececee" }}>
                    {row.map((c, k) => (
                      <Fragment key={k}>
                        {r === 0 ? (
                          <th style={{ textAlign: "left", fontWeight: 600, color: TXT_2, padding: "5px 12px 5px 0", whiteSpace: "nowrap", wordBreak: "normal" }}>{c}</th>
                        ) : (
                          <td style={{ padding: "5px 12px 5px 0", verticalAlign: "top", maxWidth: 200, whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>{c}</td>
                        )}
                      </Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </span>
        ),
      )}
    </>
  );
}
