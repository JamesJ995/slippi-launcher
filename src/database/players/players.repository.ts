import type { Kysely } from "kysely";

import type { Database } from "../types";
import type { InsertablePlayersRow, PlayersRow } from "./players.table";

export async function insertPlayer(db: Kysely<Database>, player: InsertablePlayersRow): Promise<PlayersRow> {
  const insertedPlayer = await db.insertInto("players").values(player).returningAll().executeTakeFirstOrThrow();
  return insertedPlayer;
}

export async function findAllPlayersInGame(db: Kysely<Database>, gameId: number): Promise<PlayersRow[]> {
  const players = await db.selectFrom("players").where("players.game_id", "=", gameId).selectAll().execute();
  return players;
}
