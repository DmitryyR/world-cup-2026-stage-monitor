import { spawnSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error(
    [
      "Missing database URL for Vercel build.",
      "Set DATABASE_URL to a PostgreSQL connection string, or attach Vercel Postgres so POSTGRES_PRISMA_URL/POSTGRES_URL is available.",
    ].join("\n"),
  );
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
};

run("prisma", ["generate"]);
run("prisma", ["migrate", "deploy"]);
run("next", ["build"]);

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
