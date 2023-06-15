import { Snowflake } from "discord.js";
import connection from "../../database/connection";
import { ChannelResults, ChannelStats } from "../types/interface/channel";
import { MysqlError } from "mysql";

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

            connection.mysql.query(queries[0], [guild], (error: MysqlError | null, results: Array<ChannelResults>) => {
                if (error) reject(error);
                if (results[0]) resolve();
                connection.mysql.query(queries[1], [guild], (error1: MysqlError | null) => {
                    if (error1) reject(error1);
                    resolve();
                });
            });
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
                `INSERT INTO channels (setup, guild, welcome, \`leave\`, log) VALUES (1, ?, ?, ?, ?)`
            ];

            connection.mysql.query(queries[0], [guild], (error: MysqlError | null, results: Array<ChannelResults>) => {
                if (error) reject(error);
                if (results && results[0]) {
                    connection.mysql.query(queries[1], [welcome, leave, log, results[0].id], (error1: MysqlError | null) => {
                        if (error1) reject(error1);
                        resolve();
                    });
                } else {
                    connection.mysql.query(queries[2], [guild, welcome, leave, log], (error1: MysqlError | null) => {
                        if (error1) reject(error1);
                        resolve();
                    });
                }
            });
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

            connection.mysql.query(query, [guild], (error: MysqlError | null, results: Array<ChannelResults>) => {
                if (error) reject(error);
                if (results && results[0]) {
                    resolve({
                        welcome: results[0].welcome ?? undefined,
                        leave: results[0].leave ?? undefined,
                        log: results[0].log ?? undefined
                    });
                } else resolve({
                    welcome: undefined,
                    leave: undefined,
                    log: undefined
                });
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} welcome
     * @param {Snowflake} leave
     * @param {Snowflake} guild
     * @returns {void}
     * @throws {MysqlError}
     */
    del(welcome: boolean, leave: boolean, guild: Snowflake): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const queries = [
                `SELECT * FROM channels WHERE guild = ?`,
                `UPDATE channels SET setup = 0 ${welcome ? `AND welcome = undefined` : leave ? `AND \`leave\` = undefined` : `AND log = undefined`} WHERE id = ?`
            ];

            connection.mysql.query(queries[0], [guild], (error: MysqlError | null, results: Array<ChannelResults>) => {
                if (error) reject(error);
                if (results[0]) {
                    connection.mysql.query(queries[1], [results[0].id], (error1: MysqlError | null) => {
                        if (error1) reject(error1);
                        resolve();
                    });
                } else reject(new Error("No channels found."))
            });
        });
    }
}
