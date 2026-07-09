import { spawnSync } from "node:child_process";

const databaseUrl = firstEnvValue([
  "NEON2_DATABASE_URL",
]);

const directUrl = firstEnvValue([
  "NEON2_DATABASE_URL_UNPOOLED",
]);

if (!databaseUrl) {
  console.error(
    [
      "Missing database URL for Vercel build.",
      "Set NEON2_DATABASE_URL to the runtime PostgreSQL connection string.",
      "Checked: NEON2_DATABASE_URL.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!directUrl) {
  console.error(
    [
      "Missing direct database URL for Prisma migrations.",
      "Set NEON2_DATABASE_URL_UNPOOLED to the direct/unpooled Neon PostgreSQL connection string.",
      "Checked: NEON2_DATABASE_URL_UNPOOLED.",
    ].join("\n"),
  );
  process.exit(1);
}

const env = {
  ...process.env,
  NEON2_DATABASE_URL: databaseUrl,
  NEON2_DATABASE_URL_UNPOOLED: directUrl,
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
