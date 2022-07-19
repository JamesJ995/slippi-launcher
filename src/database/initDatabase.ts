import SqliteDatabase from "better-sqlite3";
import electronLog from "electron-log";
import { Kysely, SqliteDialect } from "kysely";

import { runMigrations } from "./runMigrations";
import type { Database } from "./types";

const log = electronLog.scope("database");

export async function initDatabase({
  databasePath,
  migrationFolder,
  isDevelopment,
  enableLogging,
}: {
  databasePath: string;
  migrationFolder: string;
  isDevelopment?: boolean;
  enableLogging?: boolean;
}): Promise<Kysely<Database>> {
  // Setup the database
  const filename = isDevelopment ? ":memory:" : databasePath;
  const sqliteDb = new SqliteDatabase(filename, { verbose: enableLogging ? log.debug : undefined });
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: sqliteDb,
    }),
  });

  // Run the migrations
  await runMigrations(db, migrationFolder);

  return db;
}
