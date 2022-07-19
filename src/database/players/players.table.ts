import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export type PlayersTable = {
  id: Generated<number>;
  game_id: number; // foreign key to games table
  port: number;
  character_id: number | null;
  character_color: number | null;
  start_stocks: number | null;
  type: number | null;
  team_id: number | null;
  nametag: string | null;
  display_name: string;
  connect_code: string;
  slippi_user_id: string;
};

export type PlayersRow = Selectable<PlayersTable>;
export type InsertablePlayersRow = Insertable<PlayersTable>;
export type UpdateablePlayersRow = Updateable<PlayersTable>;
