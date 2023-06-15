import { Snowflake } from "discord.js";
import connection from "../../database/connection";
import { MysqlError } from "mysql";
import { LinkResults, LinkStats } from "../types/interface/invite";

export default {
    /**
     *
     * @function
     * @param {Snowflake} user
     * @param {Snowflake} guild
     * @param {string} code
     * @returns {void}
     * @throws {MysqlError}
     */
    add(user: Snowflake, guild: Snowflake, code: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `
                INSERT INTO links (user, guild, code) VALUES (?, ?, ?)
            `;

            connection.mysql.query(query, [user, guild, code], (error: MysqlError | null) => {
                if (error) reject(error);
                resolve();
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} guild
     * @param {string} code
     * @returns {void}
     * @throws {MysqlError}
     */
    del(guild: Snowflake, code: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `
                DELETE FROM links WHERE guild = ? AND code = ?
            `;

            connection.mysql.query(query, [guild, code], (error: MysqlError | null) => {
                if (error) reject(error);
                resolve();
            })
        })
    },

    /**
     *
     * @function
     * @param {Snowflake} guild
     * @returns {LinkStats}
     * @throws {MysqlError}
     */
    get(guild: Snowflake): Promise<LinkStats> {
        return new Promise<LinkStats>((resolve, reject) => {
            const query = ` 
                SELECT user, code FROM links WHERE guild = ?
            `;

            connection.mysql.query(query, [guild], (error: MysqlError | null, results: Array<LinkResults>) => {
                if (error) reject(error);
                const links: LinkStats = {};
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    links[result.code] = result.user;
                }
                resolve(links);
            })
        })
    }
}
