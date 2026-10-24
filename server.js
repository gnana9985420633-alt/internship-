const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { randomUUID } = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DB_PATH = process.env.DB_PATH || path.join(ROOT, "data.sqlite");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo'
      CHECK (status IN ('todo', 'doing', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('low', 'medium', 'high')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const statements = {
  list: db.prepare("SELECT * FROM tasks ORDER BY created_at DESC"),
  get: db.prepare("SELECT * FROM tasks WHERE id = ?"),
  create: db.prepare(`INSERT INTO tasks
    (id, title, description, status, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`),
  update: db.prepare(`UPDATE tasks SET title = ?, description = ?, status = ?,
    priority = ?, updated_at = ? WHERE id = ?`),
  remove: db.prepare("DELETE FROM tasks WHERE id = ?"),
  count: db.prepare("SELECT status, COUNT(*) AS count FROM tasks GROUP BY status")
};

function send(res, status, data, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  });
  res.end(contentType.startsWith("application/json") ? JSON.stringify(data) : data);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateTask(body, isUpdate = false) {
  const title = cleanText(body.title, 120);
  const description = cleanText(body.description, 1000);
  const status = body.status || "todo";
  const priority = body.priority || "medium";

  if (!title) return { error: "Task title is required." };
  if (!["todo", "doing", "done"].includes(status)) return { error: "Choose a valid task status." };
  if (!["low", "medium", "high"].includes(priority)) return { error: "Choose a valid priority." };

  return { task: { title, description, status, priority } };
}

function routeApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, { ok: true, service: "ApexPlanet TaskFlow API", timestamp: new Date().toISOString() });
  }

  if (req.method === "GET" && url.pathname === "/api/tasks") {
    const tasks = statements.list.all();
    const counts = { todo: 0, doing: 0, done: 0 };
    for (const row of statements.count.all()) counts[row.status] = Number(row.count);
    return send(res, 200, { tasks, counts, total: tasks.length });
  }

  if (req.method === "POST" && url.pathname === "/api/tasks") {
    return readJson(req).then((body) => {
      const checked = validateTask(body);
      if (checked.error) return send(res, 400, { error: checked.error });
      const now = new Date().toISOString();
      const id = randomUUID();
      const t = checked.task;
      statements.create.run(id, t.title, t.description, t.status, t.priority, now, now);
      return send(res, 201, { task: statements.get.get(id) });
    }).catch((error) => send(res, 400, { error: error.message || "Could not read request." }));
  }

  const match = url.pathname.match(/^\/api\/tasks\/([0-9a-f-]+)$/i);
  if (match && req.method === "PATCH") {
    return readJson(req).then((body) => {
      const current = statements.get.get(match[1]);
      if (!current) return send(res, 404, { error: "Task not found." });
      const checked = validateTask({
        title: body.title ?? current.title,
        description: body.description ?? current.description,
        status: body.status ?? current.status,
        priority: body.priority ?? current.priority
      }, true);
      if (checked.error) return send(res, 400, { error: checked.error });
      const t = checked.task;
      statements.update.run(t.title, t.description, t.status, t.priority, new Date().toISOString(), match[1]);
      return send(res, 200, { task: statements.get.get(match[1]) });
    }).catch((error) => send(res, 400, { error: error.message || "Could not read request." }));
  }

  if (match && req.method === "DELETE") {
    const result = statements.remove.run(match[1]);
    if (Number(result.changes) === 0) return send(res, 404, { error: "Task not found." });
    return send(res, 200, { ok: true, id: match[1] });
  }

  return send(res, 404, { error: "API endpoint not found." });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
      return send(res, 405, { error: "Method not allowed." });
    }
    return routeApi(req, res, url);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, { error: "Method not allowed." });
  }

  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, requested);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    return send(res, 403, { error: "Forbidden." });
  }

  fs.readFile(filePath, (error, content) => {
    if (error) return send(res, 404, "Page not found.", "text/plain; charset=utf-8");
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`TaskFlow running at http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});

function shutdown() {
  try { db.close(); } catch {}
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
