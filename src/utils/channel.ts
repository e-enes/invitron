import { Snowflake } from "discord.js";
import { MysqlError } from "mysql";

import { mysql } from "./mysql";
import { ChannelResults, ChannelStats } from "../types";

export default {
  /**
   *
   * @function
   * @param {Snowflake} guild
   * @returns {void}
   * @throws {MysqlError}
   */
  add(guild: Snowflake): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const queries = [
        `SELECT * FROM channels WHERE guild = ?`,
        `INSERT INTO channels (setup, guild) VALUES (0, ?)`,
      ];

      mysql.query(
        queries[0],
        [guild],
        (error: MysqlError | null, results: Array<ChannelResults>) => {
          if (error) reject(error);
          if (results[0]) resolve();
          mysql.query(queries[1], [guild], (error1: MysqlError | null) => {
            if (error1) reject(error1);
            resolve();
          });
        }
      );
    });
  },

  /**
   *
   * @function
   * @param {Snowflake} welcome
   * @param {Snowflake} leave
   * @param {Snowflake} log
   * @param {Snowflake} guild
   * @returns {void}
   * @throws {MysqlError}
   */
  set(welcome: Snowflake, leave: Snowflake, log: Snowflake, guild: Snowflake): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const queries = [
        `SELECT * FROM channels WHERE guild = ?`,
        `UPDATE channels SET setup = 1 AND welcome = ? AND \`leave\` = ? AND log = ? WHERE id = ?`,
        `INSERT INTO channels (setup, guild, welcome, \`leave\`, log) VALUES (true, ?, ?, ?, ?)`,
      ];

      mysql.query(
        queries[0],
        [guild],
        (error: MysqlError | null, results: Array<ChannelResults>) => {
          if (error) reject(error);
          if (results && results[0]) {
            mysql.query(
              queries[1],
              [welcome, leave, log, results[0].id],
              (error1: MysqlError | null) => {
                if (error1) reject(error1);
                resolve();
              }
            );
          } else {
            mysql.query(queries[2], [guild, welcome, leave, log], (error1: MysqlError | null) => {
              if (error1) reject(error1);
              resolve();
            });
          }
        }
      );
    });
  },

  /**
   *
   * @function
   * @param {Snowflake} guild
   * @returns {void}
   * @throws {MysqlError}
   */
  get(guild: Snowflake): Promise<ChannelStats> {
    return new Promise<ChannelStats>((resolve, reject) => {
      const query = `
                SELECT * FROM channels WHERE guild = ?
            `;

      mysql.query(query, [guild], (error: MysqlError | null, results: Array<ChannelResults>) => {
        if (error) reject(error);
        if (results && results[0]) {
          resolve({
            setup: results[0].setup,
            welcome: results[0].welcome,
            leave: results[0].leave,
            log: results[0].log,
          });
        } else
          resolve({
            setup: false,
            welcome: null,
            leave: null,
            log: null,
          });
      });
    });
  },

  /**
   *
   * @function
   * @param {Snowflake} channel
   * @param {Snowflake} guild
   * @returns {Promise<void>}
   * @throws {MysqlError}
   */
  del(channel: Snowflake, guild: Snowflake): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const queries = [
        `SELECT * FROM channels WHERE guild = ?`,
        `UPDATE channels SET setup = false AND \`${channel}\` = undefined WHERE id = ?`,
      ];

      mysql.query(
        queries[0],
        [guild],
        (error: MysqlError | null, results: Array<ChannelResults>) => {
          if (error) reject(error);
          if (results[0]) {
            mysql.query(queries[1], [results[0].id], (error1: MysqlError | null) => {
              if (error1) reject(error1);
              resolve();
            });
          } else reject(new Error("No channels found."));
        }
      );
    });
  },
};
