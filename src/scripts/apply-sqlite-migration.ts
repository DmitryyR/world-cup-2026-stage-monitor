import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  "prisma",
  "migrations",
  "20260704220600_init",
  "migration.sql",
);
const databasePath = resolveSqlitePath(process.env.DATABASE_URL ?? "file:./dev.db");
const sql = readFileSync(migrationPath, "utf8")
  .replaceAll("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
  .replaceAll("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ");

const db = new DatabaseSync(databasePath);
db.exec(sql);
db.close();

console.log(`SQLite schema ready at ${databasePath}`);

function resolveSqlitePath(databaseUrl: string): string {
  const filePath = databaseUrl.startsWith("file:")
    ? databaseUrl.slice("file:".length)
    : databaseUrl;

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  if (filePath === "./dev.db" || filePath === "dev.db") {
    return path.resolve("prisma", "dev.db");
  }

  return path.resolve(filePath);
}
