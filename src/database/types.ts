import type { FilesTable } from "./files/files.table";
import type { GamesTable } from "./games/games.table";
import type { PlayersTable } from "./players/players.table";

export type Database = {
  players: PlayersTable;
  games: GamesTable;
  files: FilesTable;
};
