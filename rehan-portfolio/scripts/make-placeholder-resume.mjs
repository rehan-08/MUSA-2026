// Generates a minimal one-page placeholder PDF at public/Rehan-Mhate-Resume.pdf.
// Replace the output file with the real resume; this script is only a convenience.
import { writeFileSync, mkdirSync } from "node:fs";

const lines = [
  ["F1", 22, 72, 720, "PLACEHOLDER - RESUME NOT ADDED YET"],
  ["F1", 12, 72, 690, "Replace this file with the real resume PDF:"],
  ["F1", 12, 72, 672, "public/Rehan-Mhate-Resume.pdf"],
];

const content =
  lines.map(([f, size, x, y, t]) => `BT /${f} ${size} Tf ${x} ${y} Td (${t}) Tj ET`).join("\n") + "\n";

const objs = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objs.forEach((o, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
});
const xref = pdf.length;
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((o) => {
  pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

mkdirSync("public", { recursive: true });
writeFileSync("public/Rehan-Mhate-Resume.pdf", pdf, "latin1");
console.log("wrote public/Rehan-Mhate-Resume.pdf");
