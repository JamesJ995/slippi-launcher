import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export type GamesTable = {
  id: Generated<number>;
  file_id: number; // references files table
  start_time: string | null;
  last_frame: number | null;
  is_teams: boolean | null;
  player_count: number;
  stage: number | null;
  game_mode: number | null;
};

export type GamesRow = Selectable<GamesTable>;
export type InsertableGamesRow = Insertable<GamesTable>;
export type UpdateableGamesRow = Updateable<GamesTable>;

// show me all the games where me as fox
// versed a marth on final destination
// check p1 is fox or p2 is fox or p3 is fox or p4 is fox
// select * from players where connect = me and char = fox
// join that with games where game.id = id
// where stage = final destination

// find me all the games where its me as v#0 versus taky#161 and taky's character
// is sheik, and the stage is final destination

// game id ABC taky sheik
// game id ABC v#0  falco
// join game ABC

// queries which involve having both p1 and p2

// show me all the games which are less than
// 20 seconds long

// show me all the games that i played between
// july 1 and august 2nd

// show me games where the slippi version is 3

// show me all games from folder X
