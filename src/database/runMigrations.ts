import electronLog from "electron-log";
import { promises as fs } from "fs";
import type { Kysely } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely";
import path from "path";

const log = electronLog.scope("migrations");

export async function runMigrations<T>(db: Kysely<T>, migrationFolder: string) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(({ status, migrationName }) => {
    if (status === "Success") {
      log.info(`Migration "${migrationName}" was executed successfully`);
    } else if (status === "Error") {
      log.error(`Failed to execute migration "${migrationName}"`);
    }
  });

  if (error) {
    await db.destroy();
    log.error(error);
    throw error;
  }
}
