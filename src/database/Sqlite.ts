import sqlite3 from "sqlite3";
import fs from "fs";

import Logger from "../utils/Logger.js";

class Sqlite {
  private readonly connection: sqlite3.Database;

  public constructor(dbPath: string) {
    this.connection = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve): void => {
      this.connection.serialize(async (): Promise<void> => {
        Logger.info("Connected to SQLite database");

        const { glob } = await import("glob");
        const schemaFile: string[] = await glob("scripts/schema/sqlite.sql");

        if (schemaFile.length == 0) {
          Logger.error("Schema file not found");
          throw Error("Schema file not found");
        }

        const schemaSQL: string = fs.readFileSync(schemaFile[0], "utf-8");
        this.connection.exec(schemaSQL, (error: any): void => {
          if (error) {
            Logger.error("Error executing schema SQL");
            throw error;
          }

          Logger.info("Schema SQL executed successfully");
          resolve();
        });
      });
    });
  }

  public async query(sql: string, params?: unknown[]): Promise<any> {
    return new Promise((resolve): any => {
      const type: string = sql.split(" ")[0];

      try {
        if (type === "SELECT") {
          this.connection.all(sql, params, (error: Error | null, rows: unknown[]): void => {
            if (error) {
              Logger.error(`Error executing query SQL\n\nSQL: ${sql}\nParams: ${params?.join(", ")}`);
              throw error;
            }

            resolve(rows);
          });
        } else {
          this.connection.run(sql, params, (error: Error | null): void => {
            if (error) {
              Logger.error(`Error executing query SQL\n\nSQL: ${sql}\nParams: ${params?.join(", ")}`);
              throw error;
            }

            resolve(void 0);
          });
        }
      } catch (error) {
        Logger.error(`Error executing query SQL\n\nSQL: ${sql}\nParams: ${params?.join(", ")}`);
        throw error;
      }
    });
  }

  public async ping(): Promise<number> {
    return new Promise((resolve): void => {
      resolve(0);
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise<void>((resolve): void => {
      this.connection.close((error: Error | null): void => {
        if (error) {
          Logger.error("Error closing SQLite database");
          throw error;
        }

        Logger.info("Disconnected from SQLite database");
        resolve();
      });
    });
  }
}

export default Sqlite;
