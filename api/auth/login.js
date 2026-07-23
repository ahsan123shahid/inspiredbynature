import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const email = body.email || "admin@admin.com";
  const password = body.password || "admin123";

  let userObj = {
    id: 5,
    name: "Admin",
    lastname: "User",
    email: email,
    role: email.includes("admin") || email === "admin@admin.com" ? "admin" : "customer",
    access_token: "admin_token_12345",
    refresh_token: "refresh_token_12345"
  };

  try {
    const cwd = process.cwd();
    const dbPath = path.join(cwd, "db.json");
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const found = (db.users || []).find((u) => u.email === email);
      if (found) {
        userObj = {
          ...found,
          role: found.role || (email.includes("admin") ? "admin" : "customer"),
          access_token: "admin_token_12345",
          refresh_token: "refresh_token_12345"
        };
      }
    }
  } catch (e) {
    console.error("Error reading users from db.json:", e);
  }

  res.status(200).json(userObj);
}
