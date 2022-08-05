import type { Kysely } from "kysely";

import type { Database } from "../types";
import type { FilesRow, InsertableFilesRow } from "./files.table";

export async function insertFile(db: Kysely<Database>, file: InsertableFilesRow): Promise<FilesRow> {
  const insertedFile = await db.insertInto("files").values(file).returningAll().executeTakeFirstOrThrow();
  return insertedFile;
}

export async function removeFiles(db: Kysely<Database>, filePaths: string[]): Promise<void> {
  await db.deleteFrom("files").where("files.full_path", "in", filePaths).execute();
}

/**
 * Deletes all files from the FilesTable where the files.folder is not in the list of existingFolders.
 * @param db The database instance
 * @param existingFolders List of folders to preserve
 */
export async function pruneFolders(db: Kysely<Database>, existingFolders: string[]): Promise<void> {
  await db.deleteFrom("files").where("files.folder", "not in", existingFolders).execute();
}

export async function findAllFilesInFolder(db: Kysely<Database>, folder: string): Promise<string[]> {
  const files = await db.selectFrom("files").where("files.folder", "=", folder).select("files.full_path").execute();
  return files.map((f) => f.full_path);
}
