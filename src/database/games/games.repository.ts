import type { FilesRow } from "database/files/files.table";
import type { PlayersRow } from "database/players/players.table";
import type { Kysely } from "kysely";

import type { Database } from "../types";
import type { GamesRow, InsertableGamesRow } from "./games.table";

export async function insertGame(db: Kysely<Database>, game: InsertableGamesRow): Promise<GamesRow> {
  const insertedGame = await db.insertInto("games").values(game).returningAll().executeTakeFirstOrThrow();
  return insertedGame;
}

export async function findAllGamesInFolder(
  db: Kysely<Database>,
  folder: string,
): Promise<
  {
    file: FilesRow;
    game: GamesRow;
    players: PlayersRow[];
  }[]
> {
  const games = await db
    .selectFrom("files")
    .where("files.folder", "=", folder)
    .select("files.id as file_id")
    .innerJoin("games", "files.id", "games.file_id")
    .select("games.id as game_id")
    .selectAll()
    .execute();

  const players: PlayersRow[] = [];

  return games.map((row) => ({
    file: {
      id: row.file_id,
      name: row.name,
      folder: row.folder,
      full_path: row.full_path,
    },
    game: {
      id: row.game_id,
      file_id: row.file_id,
      player_count: row.player_count,
      start_time: row.start_time,
      last_frame: row.last_frame,
      is_teams: row.is_teams,
      stage: row.stage,
      game_mode: row.game_mode,
    },
    players,
  }));
}
