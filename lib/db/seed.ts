import { db } from "./client";
import { runMigrations } from "./schema";
import { randomUUID } from "crypto";

runMigrations();

function insert(table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`
  );
  stmt.run(...Object.values(row));
}

// ── Applications ────────────────────────────────────────────────────────────
const APP_RIFTBOUND = "app-riftbound";
const APP_ONEVENUE  = "app-onevenue";

insert("applications", { id: APP_RIFTBOUND, name: "Riftbound Ticketing Portal", slug: "riftbound-ticketing-portal", description: "Main ticketing portal with frontend pages and behavior.", status: "active" });
insert("applications", { id: APP_ONEVENUE,  name: "OneVenue Backoffice",        slug: "onevenue-backoffice",        description: "Reserved for future implementation.",             status: "reserved" });

// ── Design Systems ───────────────────────────────────────────────────────────
const DS_MAIN = "ds-main";
insert("design_systems", { id: DS_MAIN, name: "Riftbound DS", version: "1.0.0", description: "Core design system shared across Riftbound applications." });
insert("ds_application_links", { ds_id: DS_MAIN, app_id: APP_RIFTBOUND });

// ── Initiatives ──────────────────────────────────────────────────────────────
const INIT_RTP   = "init-riftbound";
const INIT_GATE  = "init-gateflow";
insert("initiatives", { id: INIT_RTP,  name: "Riftbound Ticketing Portal", description: "The core ticketing application for managing support requests." });
insert("initiatives", { id: INIT_GATE, name: "GateFlow – Access Control",  description: "Access control integration layer inside Riftbound." });

// ── Epics (Riftbound) ────────────────────────────────────────────────────────
const EPIC_AUTH = "epic-auth";
const EPIC_TICK = "epic-tick";
insert("epics", { id: EPIC_AUTH, initiative_id: INIT_RTP, name: "Authentication & Access Control", start_date: "2026-01-06", due_date: "2026-02-28", assignee: "Diego A.", progress: 80 });
insert("epics", { id: EPIC_TICK, initiative_id: INIT_RTP, name: "Ticket Management",               start_date: "2026-03-02", due_date: "2026-06-30", assignee: "Carlos R.", progress: 25 });

// ── Epics (GateFlow) ─────────────────────────────────────────────────────────
const EPIC_GATE = "epic-gate";
const EPIC_REP  = "epic-rep";
insert("epics", { id: EPIC_GATE, initiative_id: INIT_GATE, name: "Gate Entry & Validation", start_date: "2026-07-01", due_date: "2026-09-30", assignee: "Diego A.", progress: 15 });
insert("epics", { id: EPIC_REP,  initiative_id: INIT_GATE, name: "Reporting & Analytics",   start_date: "2026-10-01", due_date: "2026-12-31", assignee: "Carlos R.", progress: 0  });

// ── Stories ──────────────────────────────────────────────────────────────────
const stories = [
  { id: "st-sso",     epic_id: EPIC_AUTH, name: "As a user, I can log in via SSO",               start_date: "2026-01-06", due_date: "2026-01-24", assignee: "Diego A.", progress: 100 },
  { id: "st-roles",   epic_id: EPIC_AUTH, name: "As an admin, I can manage user roles",           start_date: "2026-01-27", due_date: "2026-02-14", assignee: "Maria G.", progress: 60  },
  { id: "st-tickets", epic_id: EPIC_TICK, name: "As a user, I can create and track tickets",      start_date: "2026-03-02", due_date: "2026-04-10", assignee: "Carlos R.", progress: 50 },
  { id: "st-assign",  epic_id: EPIC_TICK, name: "As an agent, I can assign and close tickets",    start_date: "2026-04-13", due_date: "2026-05-15", assignee: "Sofia L.", progress: 0  },
  { id: "st-scan",    epic_id: EPIC_GATE, name: "As a security officer, I can scan entry badges", start_date: "2026-07-01", due_date: "2026-08-15", assignee: "Ana P.", progress: 30   },
  { id: "st-zones",   epic_id: EPIC_GATE, name: "As an admin, I can define access zones",         start_date: "2026-08-18", due_date: "2026-09-30", assignee: "Diego A.", progress: 0  },
  { id: "st-reports", epic_id: EPIC_REP,  name: "As an admin, I can view entry/exit reports",     start_date: "2026-10-01", due_date: "2026-11-30", assignee: "Carlos R.", progress: 0 },
];
for (const s of stories) insert("stories", s);

// ── Tasks ────────────────────────────────────────────────────────────────────
const tasks = [
  { id: "tk-oauth",    story_id: "st-sso",     name: "Integrate OAuth2 provider",             start_date: "2026-01-06", due_date: "2026-01-17", assignee: "Diego A.", progress: 100 },
  { id: "tk-login-ui", story_id: "st-sso",     name: "Create login page UI",                  start_date: "2026-01-13", due_date: "2026-01-20", assignee: "Diego A.", progress: 100 },
  { id: "tk-mw",       story_id: "st-sso",     name: "Write auth middleware",                 start_date: "2026-01-20", due_date: "2026-01-24", assignee: "Diego A.", progress: 100 },
  { id: "tk-roles-dm", story_id: "st-roles",   name: "Design roles & permissions model",      start_date: "2026-01-27", due_date: "2026-02-03", assignee: "Maria G.", progress: 100 },
  { id: "tk-roles-ui", story_id: "st-roles",   name: "Build admin roles UI",                  start_date: "2026-02-03", due_date: "2026-02-10", assignee: "Maria G.", progress: 60  },
  { id: "tk-roles-api",story_id: "st-roles",   name: "API endpoints for role assignment",     start_date: "2026-02-10", due_date: "2026-02-14", assignee: "Diego A.", progress: 20  },
  { id: "tk-tick-dm",  story_id: "st-tickets", name: "Design ticket data model",              start_date: "2026-03-02", due_date: "2026-03-09", assignee: "Carlos R.", progress: 100},
  { id: "tk-tick-list",story_id: "st-tickets", name: "Build ticket list view",                start_date: "2026-03-09", due_date: "2026-03-27", assignee: "Carlos R.", progress: 70 },
  { id: "tk-tick-det", story_id: "st-tickets", name: "Build ticket detail view",              start_date: "2026-03-27", due_date: "2026-04-10", assignee: "Carlos R.", progress: 10 },
  { id: "tk-assign",   story_id: "st-assign",  name: "Assignment workflow logic",             start_date: "2026-04-13", due_date: "2026-04-24", assignee: "Sofia L.", progress: 0   },
  { id: "tk-notif",    story_id: "st-assign",  name: "Email notifications on status change",  start_date: "2026-04-24", due_date: "2026-05-08", assignee: "Sofia L.", progress: 0   },
  { id: "tk-qr",       story_id: "st-scan",    name: "QR scanner integration",                start_date: "2026-07-01", due_date: "2026-07-18", assignee: "Ana P.", progress: 60    },
  { id: "tk-badge",    story_id: "st-scan",    name: "Badge validation API",                  start_date: "2026-07-18", due_date: "2026-08-01", assignee: "Ana P.", progress: 20    },
  { id: "tk-log-ui",   story_id: "st-scan",    name: "Real-time entry log UI",                start_date: "2026-08-01", due_date: "2026-08-15", assignee: "Ana P.", progress: 0     },
  { id: "tk-zones-dm", story_id: "st-zones",   name: "Zone configuration data model",         start_date: "2026-08-18", due_date: "2026-09-05", assignee: "Diego A.", progress: 0  },
  { id: "tk-zones-ui", story_id: "st-zones",   name: "Zone management UI",                    start_date: "2026-09-05", due_date: "2026-09-30", assignee: "Diego A.", progress: 0  },
  { id: "tk-pipeline", story_id: "st-reports", name: "Build reporting data pipeline",         start_date: "2026-10-01", due_date: "2026-10-31", assignee: "Carlos R.", progress: 0  },
  { id: "tk-dash",     story_id: "st-reports", name: "Design analytics dashboard",            start_date: "2026-11-01", due_date: "2026-11-30", assignee: "Sofia L.", progress: 0   },
];
for (const t of tasks) insert("tasks", t);

// ── Requirements ─────────────────────────────────────────────────────────────
const reqs = [
  { id: "req-lay-01",  initiative_id: INIT_RTP, code: "FR-LAY-01", area: "LAY",  description: "Login page must display company branding and SSO entry point", source: "Product Design",       classification: "build",  prototype_view: "Login" },
  { id: "req-auth-01", initiative_id: INIT_RTP, code: "FR-AUTH-01", area: "AUTH", description: "Users must authenticate via SSO before accessing any portal feature", source: "Security Policy", classification: "native" },
  { id: "req-tick-01", initiative_id: INIT_RTP, code: "FR-TICK-01", area: "TICK", description: "Users must be able to create, view, update, and close support tickets", source: "Business Requirements", classification: "build", prototype_view: "Ticket List" },
];
for (const r of reqs) insert("requirements", r);

// ── Traceability links ───────────────────────────────────────────────────────
insert("req_task_links", { req_id: "req-lay-01",  task_id: "tk-login-ui" });
insert("req_task_links", { req_id: "req-auth-01", task_id: "tk-oauth"    });
insert("req_task_links", { req_id: "req-auth-01", task_id: "tk-mw"       });
insert("req_task_links", { req_id: "req-tick-01", task_id: "tk-tick-list" });
insert("req_task_links", { req_id: "req-tick-01", task_id: "tk-tick-det"  });

console.log("✓ Database seeded successfully");
