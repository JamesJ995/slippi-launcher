// NOTE: This module cannot use electron-log, since it for some reason
// fails to obtain the paths required for file transport to work
// when in Node worker context.

// TODO: Make electron-log work somehow
import type { GameStartType, MetadataType, PlayerType } from "@slippi/slippi-js";
import { findAllFilesInFolder, insertFile, pruneFolders, removeFiles } from "database/files/files.repository";
import { insertGame } from "database/games/games.repository";
import type { InsertableGamesRow } from "database/games/games.table";
import { initDatabase } from "database/initDatabase";
import { insertPlayer } from "database/players/players.repository";
import type { InsertablePlayersRow } from "database/players/players.table";
import type { Database } from "database/types";
import type { Kysely } from "kysely";
import path from "path";
import type { ModuleMethods } from "threads/dist/types/master";
import { expose } from "threads/worker";

import type { FileResult } from "./types";

export interface Methods {
  dispose(): Promise<void>;
  connect(path: string): Promise<void>;
  getFolderFiles(folder: string): Promise<string[]>;
  getFolderReplays(folder: string): Promise<FileResult[]>;
  saveReplays(replays: FileResult[]): Promise<void>;
  deleteReplays(files: string[]): Promise<void>;
  pruneFolders(existingFolders: string[]): Promise<void>;
}

export type WorkerSpec = ModuleMethods & Methods;

let db: Kysely<Database>;

const parseRow = (row: any) => {
  return {
    name: row.name,
    fullPath: row.fullPath,
    settings: JSON.parse(row.settings),
    startTime: row.startTime,
    lastFrame: row.lastFrame,
    metadata: JSON.parse(row.metadata),
    stats: JSON.parse(row.stats || null),
    folder: row.folder,
  } as FileResult;
};

const methods: WorkerSpec = {
  async dispose() {
    // Clean up anything
    if (db) {
      await db.destroy();
    }
  },
  async disconnect() {
    await db.destroy();
  },
  async connect(path: string) {
    db = await initDatabase({
      databasePath: path,
      migrationFolder: "./migrations",
      isDevelopment: true,
      enableLogging: true,
    });
  },
  async getFolderFiles(folder: string): Promise<string[]> {
    return findAllFilesInFolder(db, folder);
  },
  async getFolderReplays(folder: string) {
    const docs = db
      .prepare(
        `
    SELECT fullPath, name, folder, startTime, lastFrame, 
    settings, metadata 
    FROM replays 
    JOIN replay_data USING (fullPath)
    WHERE folder = ?
    ORDER by startTime DESC`,
      )
      .all(folder);
    const files = docs.map(parseRow);
    return docs ? files : [];
  },
  async saveReplays(replays: FileResult[]) {
    await db.transaction().execute(async (trx) => {
      const insertReplayPromises = replays.map(async (replay) => {
        const { name, fullPath, settings, metadata } = replay;

        const folder = path.dirname(fullPath);
        const { id: fileId } = await insertFile(trx, {
          full_path: fullPath,
          name,
          folder,
        });

        const { id: gameId } = await insertGame(trx, {
          ...mapSettingsToInsertableGameRow(settings, metadata),
          file_id: fileId,
        });

        const insertPlayerPromises = settings.players.map(async (player) => {
          await insertPlayer(trx, {
            ...mapPlayerToInsertablePlayerRow(player, settings, metadata),
            game_id: gameId,
          });
        });
        await Promise.all(insertPlayerPromises);
      });

      await Promise.all(insertReplayPromises);
    });
  },
  async deleteReplays(files: string[]) {
    await removeFiles(db, files);
  },
  async pruneFolders(existingFolders: string[]) {
    await pruneFolders(db, existingFolders);
  },
};

expose(methods);

function mapSettingsToInsertableGameRow(
  settings: GameStartType,
  metadata?: MetadataType | null,
): Omit<InsertableGamesRow, "file_id"> {
  return {
    player_count: settings.players.length,
    start_time: metadata?.startAt,
    last_frame: metadata?.lastFrame,
    is_teams: settings.isTeams,
    stage: settings.stageId,
    game_mode: settings.gameMode,
  };
}

function mapPlayerToInsertablePlayerRow(
  player: PlayerType,
  settings: GameStartType,
  metadata?: MetadataType | null,
): Omit<InsertablePlayersRow, "game_id"> {
  const displayName = metadata?.players?.[player.playerIndex].names?.netplay ?? player.displayName;
  const connectCode = metadata?.players?.[player.playerIndex].names?.code ?? player.connectCode;

  return {
    port: player.port,
    character_id: player.characterId,
    character_color: player.characterColor,
    start_stocks: player.startStocks,
    type: player.type,
    team_id: settings.isTeams ? player.teamId : null,
    nametag: player.nametag,
    display_name: displayName || null,
    connect_code: connectCode || null,
    slippi_user_id: player.userId || null,
  };
}
