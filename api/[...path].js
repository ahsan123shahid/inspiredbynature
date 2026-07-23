import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "db.json");
let db = null;

function loadDb() {
  if (!db) {
    try {
      const cwd = process.cwd();
      const candidates = [
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const db = loadDb();
  const segments = (req.query.path || []).filter(Boolean);
  const resource = segments[0];
  const id = segments[1];

  try {
    if (req.method !== "GET") {
      const body =
        req.method === "DELETE" ? {} : req.body || {};
      res.status(200).json(body);
      return;
    }

    if (!resource) {
      res.status(200).json(db);
      return;
    }

    let collection = db[resource];
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
    if (params._sort && Array.isArray(result)) {
      const dir = params._order === "desc" ? -1 : 1;
      result = [...result].sort((a, b) =>
        a[params._sort] > b[params._sort] ? dir : -dir
      );
    }
    if (params._limit && Array.isArray(result)) {
      result = result.slice(0, Number(params._limit));
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
