import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type User = {
  id: number;
  user_number: string; // "001" ... "100"
  token: string; // unguessable URL token
  name: string | null;
  email: string | null;
  registered_at: string | null;
  redirect_to: string | null; // optional override; empty means APP_URL/u/token
};

function createDb() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, "app.db"));
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(database: ReturnType<typeof createDb>) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_number TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      registered_at TEXT,
      redirect_to TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const cols = database.prepare("PRAGMA table_info(users)").all() as {
    name: string;
  }[];
  if (!cols.some((col) => col.name === "redirect_to")) {
    database.exec("ALTER TABLE users ADD COLUMN redirect_to TEXT");
  }
}

// Cache the connection on globalThis so Next.js dev-mode hot reloads
// don't open a new database handle on every change.
const globalForDb = globalThis as unknown as {
  __db?: ReturnType<typeof createDb>;
};

export const db = (globalForDb.__db ??= createDb());
migrate(db);

export function getUserByToken(token: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE token = ?").get(token) as
    | User
    | undefined;
}

export function getUserByNumber(userNumber: string): User | undefined {
  return db
    .prepare("SELECT * FROM users WHERE user_number = ?")
    .get(userNumber) as User | undefined;
}

export function getAllUsers(): User[] {
  return db
    .prepare("SELECT * FROM users ORDER BY user_number")
    .all() as User[];
}

/** Admin: overwrite name/email regardless of registration state. */
export function adminUpdateUser(
  userNumber: string,
  name: string,
  email: string
): boolean {
  const result = db
    .prepare(
      `UPDATE users
       SET name = ?,
           email = ?,
           registered_at = COALESCE(registered_at, datetime('now'))
       WHERE user_number = ?`
    )
    .run(name, email, userNumber);
  return result.changes === 1;
}

/** Admin: clear registration so the user can register again via their QR code. */
export function adminResetUser(userNumber: string): boolean {
  const result = db
    .prepare(
      "UPDATE users SET name = NULL, email = NULL, registered_at = NULL WHERE user_number = ?"
    )
    .run(userNumber);
  return result.changes === 1;
}

/**
 * One-time registration: the UPDATE only matches while `name` is still NULL,
 * so a second submission (even a concurrent one) changes zero rows.
 */
export function registerUser(
  token: string,
  name: string,
  email: string
): boolean {
  const result = db
    .prepare(
      `UPDATE users
       SET name = ?, email = ?, registered_at = datetime('now')
       WHERE token = ? AND name IS NULL`
    )
    .run(name, email, token);
  return result.changes === 1;
}
