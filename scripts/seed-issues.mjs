#!/usr/bin/env node
// Creates labels, milestones and issues from docs/02-backlog.md using the GitHub CLI (gh).
//
// Usage:
//   node scripts/seed-issues.mjs --dry-run                       # preview only
//   node scripts/seed-issues.mjs --repo OWNER/REPO               # create labels, milestones, issues
//   node scripts/seed-issues.mjs --repo OWNER/REPO --project 1 --owner OWNER   # also add to Project #1
//
// Prerequisites: gh auth login   (and for --project: gh auth refresh -s project)
// Safe to re-run: skips issues whose title already exists.

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const DRY = flag("dry-run");
const REPO = opt("repo");
const PROJECT = opt("project");
const OWNER = opt("owner");
const FILE = opt("file") ?? "docs/02-backlog.md";
if (!DRY && !REPO) {
  console.error("Pass --repo OWNER/REPO (or --dry-run)");
  process.exit(1);
}

// ---------- parse backlog ----------
const md = readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
const milestones = [];
const tasks = [];
let curMs = null,
  curTask = null;
for (const line of md.split("\n")) {
  const ms = line.match(/^## Milestone:\s*(.+)$/);
  const tk = line.match(/^### (T-\d+)\s*·\s*(.+)$/);
  if (ms) {
    curMs = { title: ms[1].trim(), description: "" };
    milestones.push(curMs);
    curTask = null;
    continue;
  }
  if (tk) {
    curTask = {
      id: tk[1],
      title: `${tk[1]} · ${tk[2].trim()}`,
      milestone: curMs?.title,
      body: [],
      labels: [],
    };
    tasks.push(curTask);
    continue;
  }
  if (curTask) {
    const lb = line.match(/^- \*\*Labels:\*\*\s*(.+)$/);
    if (lb)
      curTask.labels = lb[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    curTask.body.push(line);
  } else if (curMs && line.trim()) {
    curMs.description += (curMs.description ? " " : "") + line.trim();
  }
}
for (const t of tasks) t.body = t.body.join("\n").trim() + "\n\n---\n_Source: `" + FILE + "`_";

// ---------- label colours ----------
const colourFor = (l) =>
  ({
    "type:feature": "1D76DB",
    "type:chore": "C5DEF5",
    "type:docs": "0075CA",
    "type:test": "BFD4F2",
    "type:ci": "5319E7",
    "type:bug": "D73A4A",
    "model:opus": "B60205",
    "model:sonnet": "FBCA04",
    "model:haiku": "0E8A16",
    "priority:P1": "D93F0B",
    "priority:P2": "F9D0C4",
    "priority:P3": "EDEDED",
    "size:S": "C2E0C6",
    "size:M": "7FD1A6",
    "size:L": "2EA44F",
  })[l] ?? "D4C5F9";
const allLabels = [
  ...new Set([...tasks.flatMap((t) => t.labels), "type:bug", "skip-release-notes"]),
];

console.log(
  `Parsed ${milestones.length} milestones, ${tasks.length} tasks, ${allLabels.length} labels.`,
);
if (DRY) {
  for (const m of milestones) {
    console.log(`\n# ${m.title}`);
    for (const t of tasks.filter((x) => x.milestone === m.title))
      console.log(`  - ${t.title}  [${t.labels.join(", ")}]`);
  }
  process.exit(0);
}

// ---------- gh helpers ----------
function gh(argv, input) {
  const r = spawnSync("gh", argv, { input, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

// labels
for (const l of allLabels) {
  const r = gh(["label", "create", l, "--repo", REPO, "--color", colourFor(l), "--force"]);
  console.log(r.ok ? `label ✓ ${l}` : `label ✗ ${l}: ${r.err}`);
}

// milestones
const existingMs = JSON.parse(
  gh(["api", `repos/${REPO}/milestones?state=all&per_page=100`]).out || "[]",
).map((m) => m.title);
for (const m of milestones) {
  if (existingMs.includes(m.title)) {
    console.log(`milestone = ${m.title}`);
    continue;
  }
  const r = gh([
    "api",
    `repos/${REPO}/milestones`,
    "-f",
    `title=${m.title}`,
    "-f",
    `description=${m.description}`,
  ]);
  console.log(r.ok ? `milestone ✓ ${m.title}` : `milestone ✗ ${m.title}: ${r.err}`);
}

// issues
const existing = new Set(
  JSON.parse(
    gh(["issue", "list", "--repo", REPO, "--state", "all", "--limit", "500", "--json", "title"])
      .out || "[]",
  ).map((i) => i.title),
);
for (const t of tasks) {
  if (existing.has(t.title)) {
    console.log(`issue = ${t.title} (exists)`);
    continue;
  }
  const a = ["issue", "create", "--repo", REPO, "--title", t.title, "--body-file", "-"];
  for (const l of t.labels) a.push("--label", l);
  if (t.milestone) a.push("--milestone", t.milestone);
  const r = gh(a, t.body);
  if (!r.ok) {
    console.log(`issue ✗ ${t.title}: ${r.err}`);
    continue;
  }
  console.log(`issue ✓ ${t.title} → ${r.out}`);
  if (PROJECT) {
    const p = gh([
      "project",
      "item-add",
      PROJECT,
      "--owner",
      OWNER ?? REPO.split("/")[0],
      "--url",
      r.out,
    ]);
    if (!p.ok) console.log(`  project ✗ ${p.err}`);
  }
}
console.log("Done.");
