import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("files")
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("full_path", "text", (col) => col.notNull().unique())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("folder", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("games")
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("file_id", "integer", (col) => col.notNull())
    .addColumn("start_time", "text")
    .addColumn("last_frame", "integer")
    .addColumn("is_teams", "integer")
    .addColumn("player_count", "integer")
    .addColumn("stage", "integer")
    .addColumn("game_mode", "integer")
    .execute();

  await db.schema
    .createTable("players")
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("game_id", "integer", (col) => col.notNull())
    .addColumn("port", "integer", (col) => col.notNull())
    .addColumn("character_id", "integer")
    .addColumn("character_color", "integer")
    .addColumn("start_stocks", "integer")
    .addColumn("type", "integer")
    .addColumn("team_id", "integer")
    .addColumn("nametag", "text")
    .addColumn("display_name", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("connect_code", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("slippi_user_id", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema.createIndex("idx_files_folder").on("files").column("folder").execute();
  await db.schema.createIndex("idx_games_file_id").on("games").column("file_id").execute();
  await db.schema.createIndex("idx_players_game_id").on("players").column("game_id").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("files").execute();
  await db.schema.dropTable("games").execute();
  await db.schema.dropTable("players").execute();
}
