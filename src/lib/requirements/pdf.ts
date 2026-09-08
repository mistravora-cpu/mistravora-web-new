import "server-only";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RequirementRecord } from "./record";
let fontBytes: Promise<Buffer> | undefined;
const money = (value: number) =>
  `LKR ${Math.round(value).toLocaleString("en-LK")}`;
export async function buildQuotationPdf(record: RequirementRecord) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  fontBytes ??= readFile(
    path.join(process.cwd(), "src/assets/fonts/NotoSans-Regular.ttf"),
  );
  const font = await doc.embedFont(await fontBytes, { subset: true });
  doc.setTitle(`${record.reference} - Preliminary project quotation`);
  doc.setAuthor(record.business.name);
  doc.setCreationDate(new Date(record.submittedAt));
  doc.setModificationDate(new Date(record.submittedAt));
  let page = doc.addPage([595.28, 841.89]),
    y = 788;
  const newPage = () => {
    page = doc.addPage([595.28, 841.89]);
    y = 788;
  };
  function text(value: string, size = 10, color = rgb(0.16, 0.19, 0.23)) {
    for (const paragraph of value
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
      .split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? line + " " + word : word;
        if (font.widthOfTextAtSize(candidate, size) > 490 && line) {
          if (y < 64) newPage();
          page.drawText(line, { x: 52, y, size, font, color });
          y -= size * 1.55;
          line = "";
        }
        if (font.widthOfTextAtSize(word, size) > 490) {
          for (const char of word) {
            if (font.widthOfTextAtSize(line + char, size) > 490) {
              if (y < 64) newPage();
              page.drawText(line, { x: 52, y, size, font, color });
              y -= size * 1.55;
              line = "";
            }
            line += char;
          }
        } else line = line ? line + " " + word : word;
      }
      if (y < 64) newPage();
      if (line) page.drawText(line, { x: 52, y, size, font, color });
      y -= size * 1.55;
    }
  }
  const title = (value: string) => {
    y -= 10;
    text(value, 14, rgb(0.04, 0.35, 0.4));
    y -= 3;
  };
  text(record.business.name, 25, rgb(0.04, 0.35, 0.4));
  text("PRELIMINARY PROJECT QUOTATION", 14);
  text("Planning estimate - subject to scope review", 10);
  text(`Reference: ${record.reference} | ${record.submittedAt.slice(0, 10)}`);
  text(`${record.business.email} | ${record.business.phone}`);
  title("Prepared for");
  text(
    `${record.contact.name}${record.contact.company ? " - " + record.contact.company : ""}`,
  );
  text(record.contact.email);
  const e = record.estimate;
  title(e.project);
  text(`Estimated investment: ${money(e.low)} - ${money(e.high)}`, 15);
  text(`30% advance: ${money(e.advanceLow)} - ${money(e.advanceHigh)}`);
  text("Advance is due against the agreed project price before work begins.");
  text(`Maintenance: ${money(e.monthly)}/month (separate from development)`);
  text(
    `Estimated delivery: ${e.weeksLow}-${e.weeksHigh} weeks after scope approval, advance and required assets.`,
  );
  text(`${e.design} | ${e.timeline} | ${e.maintenance}`);
  text(record.terms.notice);
  for (const warning of e.warnings) text(warning);
  title("Capabilities and planning assumptions");
  text(
    `Base and selected capabilities subtotal: ${money(e.subtotal)} (before multipliers)`,
  );
  for (const line of e.lines)
    text(
      `${line.label}: ${line.included ? "Included in base" : money(line.price)}`,
    );
  title("Indicative delivery plan");
  for (const phase of e.phases)
    text(`Weeks ${phase.startWeek}-${phase.endWeek}: ${phase.label}`);
  let group = "";
  for (const item of record.summary) {
    if (item.group !== group) {
      title(item.group);
      group = item.group;
    }
    text(item.label, 11);
    text(item.value);
    y -= 3;
  }
  title("Exclusions and next steps");
  for (const exclusion of record.terms.exclusions) text("- " + exclusion);
  text(
    "Mistravora will review these requirements and respond within 24 hours. No payment is collected by this tool.",
  );
  const pages = doc.getPages();
  pages.forEach((p, index) =>
    p.drawText(
      `${record.reference} | Preliminary estimate | ${index + 1}/${pages.length}`,
      { x: 52, y: 30, size: 8, font, color: rgb(0.4, 0.4, 0.4) },
    ),
  );
  return Buffer.from(await doc.save());
}
