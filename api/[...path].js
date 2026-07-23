import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

function loadDb() {
  if (!db) {
    try {
      const cwd = process.cwd();
      const candidates = [
        "/tmp/db.json",
        path.join(cwd, "db.json"),
        path.join(cwd, "src", "data", "db.json"),
        path.join(__dirname, "..", "db.json"),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, "utf-8");
          db = JSON.parse(raw);
          break;
        }
      }
    } catch (e) {
      console.error("Error reading db.json in Vercel API:", e);
    }
  }
  return db || { products: [], categories: [], "sub-categories": [] };
}

function saveDb(data) {
  try {
    const cwd = process.cwd();
    const targets = [
      "/tmp/db.json",
      path.join(cwd, "db.json"),
      path.join(cwd, "src", "data", "db.json")
    ];
    for (const target of targets) {
      try {
        fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf-8");
      } catch {
        // ignore read-only file system errors on Vercel lambda
      }
    }
  } catch (err) {
    console.error("Failed to save db in Vercel API:", err);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const database = loadDb();
  let segments = [];
  if (Array.isArray(req.query.path)) {
    segments = req.query.path;
  } else if (typeof req.query.path === "string") {
    segments = req.query.path.split("/").filter(Boolean);
  } else {
    const urlPath = (req.url || "").split("?")[0].replace(/^\/api\/?/, "");
    segments = urlPath.split("/").filter(Boolean);
  }

  const resource = segments[0];
  const id = segments[1];

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  try {
    // Handle auth login
    if (resource === "auth" && (id === "login" || segments[1] === "login")) {
      const users = database.users || [];
      const found = users.find((u) => u.email === body.email);
      const userObj = found || {
        id: 5,
        name: "Admin User",
        email: body.email || "admin@admin.com",
        role: "admin"
      };
      res.status(200).json({
        ...userObj,
        role: userObj.role || "admin",
        access_token: "admin_token_12345"
      });
      return;
    }

    // Handle POST (Create)
    if (req.method === "POST" && resource) {
      if (!Array.isArray(database[resource])) {
        database[resource] = [];
      }
      const newId = body.id || body.cat_id || body.subcat_id || String(Date.now());
      const newItem = { id: newId, ...body };
      database[resource].unshift(newItem);
      saveDb(database);
      res.status(201).json(newItem);
      return;
    }

    // Handle PUT / PATCH (Update)
    if ((req.method === "PUT" || req.method === "PATCH") && resource) {
      const arr = database[resource];
      if (Array.isArray(arr)) {
        const idx = arr.findIndex(
          (x) => String(x.id) === String(id) || String(x.cat_id) === String(id) || String(x.subcat_id) === String(id)
        );
        if (idx !== -1) {
          arr[idx] = { ...arr[idx], ...body };
          saveDb(database);
          res.status(200).json(arr[idx]);
          return;
        }
      }
      res.status(200).json(body);
      return;
    }

    // Handle DELETE (Remove)
    if (req.method === "DELETE" && resource) {
      const arr = database[resource];
      if (Array.isArray(arr) && id) {
        database[resource] = arr.filter(
          (x) => String(x.id) !== String(id) && String(x.cat_id) !== String(id) && String(x.subcat_id) !== String(id)
        );
        saveDb(database);
      }
      res.status(200).json({ success: true });
      return;
    }

    // Handle GET (Read)
    if (!resource) {
      res.status(200).json(database);
      return;
    }

    let collection = database[resource];
    if (!Array.isArray(collection)) {
      collection = collection != null ? collection : [];
    }

    if (id != null) {
      const item = (Array.isArray(collection) ? collection : []).find(
        (x) =>
          String(x.id) === String(id) ||
          String(x.cat_id) === String(id) ||
          String(x.subcat_id) === String(id) ||
          String(x.cat_item_id) === String(id)
      );
      res.status(item ? 200 : 404).json(item || {});
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const params = Object.fromEntries(url.searchParams.entries());
    let result = collection;
    const queryKeys = Object.keys(params).filter(
      (k) => k !== "_limit" && k !== "_sort" && k !== "_order"
    );
    if (queryKeys.length && Array.isArray(result)) {
      result = result.filter((item) =>
        queryKeys.every((k) => String(item[k]) === String(params[k]))
      );
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
