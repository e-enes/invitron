import { createPool, Pool, PoolConnection } from "mysql2/promise";
import fs from "fs";

import Logger from "../utils/Logger.js";

interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  database: string;
  password: string;
}

class MySql {
  private readonly pool: Pool;

  public constructor({ host, port, user, database, password }: MysqlConfig) {
    this.pool = createPool({ host, port, user, database, password });
  }

  public async connect(): Promise<void> {
    try {
      await this.pool.getConnection().then((conn: PoolConnection) => conn.release());
      Logger.info("Connected to MySQL database");

      const { glob } = await import("glob");
      const schemaFile: string[] = await glob("scripts/schema/mysql.sql");

      if (schemaFile.length === 0) {
        Logger.error("Schema file not found");
        return Promise.reject("Schema file not found");
      }

      const schemaSQL: string = fs.readFileSync(schemaFile[0], "utf-8");
      await this.pool.query(schemaSQL);
      Logger.info("Schema SQL executed successfully");
    } catch (error) {
      Logger.error("Error executing schema SQL");
      throw error;
    }
  }

  public async query(sql: string, params?: unknown[]): Promise<any> {
    try {
      return await this.pool.query(sql, params);
    } catch (error) {
      Logger.error(`Error executing query SQL\n\nSQL: ${sql}\nParams: ${params?.join(", ")}\n\n`, error);
      return Promise.reject(error);
    }
  }

  public async ping(): Promise<number> {
    const start = Date.now();
    await this.pool.query("SELECT 1");
    return Date.now() - start;
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      Logger.info("Disconnected from MySQL database");
    } catch (error) {
      Logger.error("Error disconnecting from MySQL database");
      throw error;
    }
  }
}

export default MySql;
