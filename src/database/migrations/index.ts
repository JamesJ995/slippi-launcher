import type { Migration } from "kysely";

const migrations = ["20220714_create_table"];

export async function getMigrations(): Promise<Record<string, Migration>> {
  const migrationsMap: Record<string, Migration> = {};
  for (const m of migrations) {
    migrationsMap[m] = await import(`./${m}`);
  }
  return migrationsMap;
}
