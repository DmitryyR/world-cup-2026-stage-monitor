import { spawnSync } from "node:child_process";

const databaseUrl = firstEnvValue([
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_POSTGRES_URL",
  "POSTGRES_URL",
]);

const directUrl = firstEnvValue([
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "DATABASE_POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_POSTGRES_URL",
  "POSTGRES_URL",
]);

if (!databaseUrl) {
  console.error(
    [
      "Missing database URL for Vercel build.",
      "Set DATABASE_URL to the runtime PostgreSQL connection string.",
      "Checked: DATABASE_URL, POSTGRES_PRISMA_URL, DATABASE_POSTGRES_URL, POSTGRES_URL.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!directUrl) {
  console.error(
    [
      "Missing direct database URL for Prisma migrations.",
      "Set DIRECT_URL to the direct/unpooled Neon PostgreSQL connection string.",
      "Checked: DIRECT_URL, DATABASE_URL_UNPOOLED, DATABASE_POSTGRES_URL_NON_POOLING, POSTGRES_URL_NON_POOLING, DATABASE_POSTGRES_URL, POSTGRES_URL.",
    ].join("\n"),
  );
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  DIRECT_URL: directUrl,
};

run("prisma", ["generate"]);
run("prisma", ["migrate", "deploy"]);
run("next", ["build"]);

function firstEnvValue(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

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
