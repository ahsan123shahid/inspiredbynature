const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "db.json");
let db = null;

function loadDb() {
  if (!db) {
    const raw = fs.readFileSync(dbPath, "utf-8");
    db = JSON.parse(raw);
  }
  return db;
}

function send(res, status, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  const db = loadDb();
  const segments = (req.query.path || []).filter(Boolean);
  const resource = segments[0];
  const id = segments[1];

  try {
    // Write methods are unsupported in this static demo backend.
    if (req.method !== "GET") {
      return send(res, 200, req.method === "DELETE" ? {} : (req.body || {}));
    }

    if (!resource) return send(res, 200, db);

    let collection = db[resource];
    if (!Array.isArray(collection)) {
      // Some resources may be nested objects; fall back to empty.
      collection = collection != null ? collection : [];
    }

    if (id != null) {
      const item = (Array.isArray(collection) ? collection : [])
        .find((x) => String(x.id) === String(id) || String(x.cat_id) === String(id) || String(x.subcat_id) === String(id) || String(x.cat_item_id) === String(id));
      return send(res, item ? 200 : 404, item || {});
    }

    // Support simple query params (?key=value) json-server style.
    const url = new URL(req.url, "http://localhost");
    const params = Object.fromEntries(url.searchParams.entries());
    let result = collection;
    const queryKeys = Object.keys(params).filter((k) => k !== "_limit" && k !== "_sort" && k !== "_order");
    if (queryKeys.length && Array.isArray(result)) {
      result = result.filter((item) =>
        queryKeys.every((k) => String(item[k]) === String(params[k]))
      );
    }
    if (params._sort && Array.isArray(result)) {
      const dir = params._order === "desc" ? -1 : 1;
      result = [...result].sort((a, b) => (a[params._sort] > b[params._sort] ? dir : -dir));
    }
    if (params._limit && Array.isArray(result)) {
      result = result.slice(0, Number(params._limit));
    }

    return send(res, 200, result);
  } catch (e) {
    return send(res, 500, { error: "Server error" });
  }
};
