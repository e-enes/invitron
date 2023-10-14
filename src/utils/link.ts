import { Snowflake } from "discord.js";
import { MysqlError } from "mysql";

import { mysql } from "./mysql";
import { LinkResults, LinkStats } from "../types";

export default {
  /**
   * Adds a link record to the database.
   *
   * @function
   * @param {Snowflake} user - The user ID associated with the link.
   * @param {Snowflake} guild - The guild ID associated with the link.
   * @param {string} code - The code for the link.
   * @returns {Promise<void>}
   * @throws {MysqlError}
   */
  add(user: Snowflake, guild: Snowflake, code: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const query = `
                INSERT INTO links (user, guild, code) VALUES (?, ?, ?)
            `;

      mysql.query(query, [user, guild, code], (error: MysqlError | null) => {
        if (error) reject(error);
        resolve();
      });
    });
  },

  /**
   * Deletes a link record from the database.
   *
   * @function
   * @param {Snowflake} guild - The guild ID associated with the link.
   * @param {string} code - The code for the link to delete.
   * @returns {Promise<void>}
   * @throws {MysqlError}
   */
  del(guild: Snowflake, code: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const query = `
                DELETE FROM links WHERE guild = ? AND code = ?
            `;

      mysql.query(query, [guild, code], (error: MysqlError | null) => {
        if (error) reject(error);
        resolve();
      });
    });
  },

  /**
   * Retrieves link statistics for a guild from the database.
   *
   * @function
   * @param {Snowflake} guild - The guild ID to fetch link statistics for.
   * @returns {Promise<LinkStats>} - A Promise that resolves to the link statistics.
   * @throws {MysqlError}
   */
  get(guild: Snowflake): Promise<LinkStats> {
    return new Promise<LinkStats>((resolve, reject) => {
      const query = ` 
                SELECT user, code FROM links WHERE guild = ?
            `;

      mysql.query(query, [guild], (error: MysqlError | null, results: Array<LinkResults>) => {
        if (error) reject(error);
        const links: LinkStats = {};
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          links[result.code] = result.user;
        }
        resolve(links);
      });
    });
  },
};
