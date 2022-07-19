import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export type FilesTable = {
  id: Generated<number>;
  full_path: string;
  name: string;
  folder: string;
};

export type FilesRow = Selectable<FilesTable>;
export type InsertableFilesRow = Insertable<FilesTable>;
export type UpdateableFilesRow = Updateable<FilesTable>;
