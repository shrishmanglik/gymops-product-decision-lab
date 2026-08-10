import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

const repoRoot = process.cwd();
const fleetRoot = process.env.GYMOPS_FLEET_ROOT?.trim()
  ? resolve(process.env.GYMOPS_FLEET_ROOT)
  : resolve(repoRoot, "..");
const reportPath = join(repoRoot, "evidence", "contamination-report.json");
const selfPath = join(repoRoot, "scripts", "contamination-check.mjs");
const extensions = new Set([".md", ".ts", ".tsx", ".json"]);
const ignored = new Set([".git", ".next", "node_modules", "coverage", "playwright-report", "test-results"]);

// These strings are permitted in this checker only. Their presence anywhere in
// product copy, fixtures, documentation, or evidence fails the gate.
const banned = [
  "DecisionRail", "Make the decision replayable", "Run 24 controls", "CV-R",
  "CustomerEvidence.v1", "OpportunityContract.v1", "ProductControlDecision.v1",
  "HandoffBundle.v1", "Motion Recruitment", "CanadaHelps", "donor", "charity",
  "fundraising", "giving", "Harvey", "Veeva", "QualityDocs", "LabelGuard",
];

function walk(root) {
  const files = [];
  if (!existsSync(root)) return files;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const target = join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (extensions.has(extname(entry.name).toLowerCase()) && statSync(target).size <= 1_000_000) files.push(target);
  }
  return files;
}

function isMaterialCurrent(path) {
  const rel = relative(repoRoot, path).replaceAll("\\", "/");
  if (path === selfPath || rel.startsWith("tests/") || rel.startsWith("evidence/contamination-report")) return false;
  return rel === "README.md" || rel.startsWith("docs/") || rel.startsWith("app/") ||
    rel.startsWith("components/") || rel.startsWith("fixtures/") || rel.startsWith("lib/data/") ||
    rel.startsWith("lib/engine/") || rel.startsWith("lib/prototype/") || rel.startsWith("evidence/");
}

function normalize(value) {
  return value
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[`*_#>|{}()[\]<>:=/\\.,;!?+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function materialText(path) {
  const raw = readFileSync(path, "utf8");
  const extension = extname(path).toLowerCase();
  if (extension === ".md") return raw;
  if (extension === ".json") {
    try {
      const values = [];
      const visit = (value) => {
        if (typeof value === "string") values.push(value);
        else if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") Object.values(value).forEach(visit);
      };
      visit(JSON.parse(raw));
      return values.join("\n\n");
    } catch {
      return "";
    }
  }
  const values = [];
  for (const match of raw.matchAll(/["'`]([^"'`\r\n]{20,})["'`]/g)) values.push(match[1]);
  for (const match of raw.matchAll(/>([^<>{}\r\n]{10,})</g)) values.push(match[1]);
  return values.join("\n\n");
}

function sequences(text) {
  const all = new Map();
  for (const unit of text.split(/\r?\n\s*\r?\n|[.!?]\s+/)) {
    const words = normalize(unit).split(" ").filter((word) => word.length > 1);
    if (words.length < 12) continue;
    for (let index = 0; index <= words.length - 12; index += 1) {
      const sequence = words.slice(index, index + 12).join(" ");
      const distinctive = new Set(words.slice(index, index + 12).filter((word) => word.length >= 5));
      if (distinctive.size >= 6) all.set(createHash("sha256").update(sequence).digest("hex"), sequence);
    }
    const paragraph = words.join(" ");
    if (paragraph.length >= 100) all.set(createHash("sha256").update(paragraph).digest("hex"), paragraph);
  }
  return all;
}

const currentFiles = walk(repoRoot).filter(isMaterialCurrent);
const bannedFindings = [];
for (const path of currentFiles) {
  const text = readFileSync(path, "utf8");
  for (const token of banned) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) {
      bannedFindings.push({ file: relative(repoRoot, path).replaceAll("\\", "/"), token });
    }
  }
}

const currentSequences = new Map();
for (const path of currentFiles) {
  for (const [hash, sequence] of sequences(materialText(path))) {
    if (!currentSequences.has(hash)) currentSequences.set(hash, { file: relative(repoRoot, path).replaceAll("\\", "/"), sequence });
  }
}

const externalIndex = new Map();
let externalRepos = 0;
let externalFiles = 0;
if (existsSync(fleetRoot)) {
  for (const entry of readdirSync(fleetRoot, { withFileTypes: true })) {
    const root = join(fleetRoot, entry.name);
    if (
      !entry.isDirectory()
      || resolve(root) === resolve(repoRoot)
      || entry.name.toLowerCase() === basename(repoRoot).toLowerCase()
      || !existsSync(join(root, ".git"))
    ) continue;
    externalRepos += 1;
    for (const path of walk(root)) {
      const rel = relative(root, path).replaceAll("\\", "/");
      if (rel.startsWith("tests/") || rel.startsWith("scripts/") || rel.includes("package-lock")) continue;
      externalFiles += 1;
      for (const [hash, sequence] of sequences(materialText(path))) {
        if (!externalIndex.has(hash)) externalIndex.set(hash, { repo: basename(root), file: rel, sequence });
      }
    }
  }
}

const proseCollisions = [];
for (const [hash, current] of currentSequences) {
  const external = externalIndex.get(hash);
  if (external) proseCollisions.push({ hash, currentFile: current.file, externalRepo: external.repo, externalFile: external.file, sequence: current.sequence });
}

const report = {
  version: "ContaminationReport.v1",
  algorithm: "normalized-material-paragraph-and-12-word-sequence-sha256",
  currentFiles: currentFiles.length,
  currentMaterialSequences: currentSequences.size,
  externalRepos,
  externalFiles,
  populationIssues: externalRepos === 0
    ? ["No sibling product repository was available for the cross-repository prose comparison."]
    : [],
  bannedFindings,
  proseCollisions,
  exceptions: [
    "license text",
    "dependency-generated boilerplate",
    "framework command names",
    "canonical claim-state labels",
  ],
  state: externalRepos > 0 && bannedFindings.length === 0 && proseCollisions.length === 0 ? "PASS" : "FAIL",
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ state: report.state, currentFiles: report.currentFiles, externalRepos, externalFiles, populationIssues: report.populationIssues.length, bannedFindings: bannedFindings.length, proseCollisions: proseCollisions.length })}\n`);
if (report.state !== "PASS") process.exitCode = 1;
