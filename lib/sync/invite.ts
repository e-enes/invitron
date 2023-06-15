import connection from "../../database/connection";
import {
    InviteResults,
    InviteResultsRow,
    InviteStats,
    LeaderboardResults,
    LeaderboardStats, WhoUsed
} from "../types/interface/invite";
import { Snowflake } from "discord.js";
import { MysqlError } from "mysql";

export default {
    /**
     *
     * @function
     * @param {Snowflake} user
     * @param {Snowflake} guild
     * @returns {Snowflake}
     * @throws {MysqlError}
     */
    getInviter(user: Snowflake, guild: Snowflake): Promise<Snowflake> {
        return new Promise<Snowflake>((resolve, reject) => {
            const query = `
                SELECT * FROM invites WHERE user = ? AND guild = ? AND inactive = 0
            `;

            connection.mysql.query(query, [user, guild], (error: MysqlError | null, results: Array<InviteResultsRow>) => {
                if (error) reject(error);
                if (results && results[0]) resolve(results[0].inviter);
                reject(new Error("No inviter found"));
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} inviter
     * @param {Snowflake} guild
     * @returns {InviteStats}
     * @throws {MysqlError}
     */
    getInvites(inviter: Snowflake, guild: Snowflake): Promise<InviteStats> {
        return new Promise<InviteStats>((resolve, reject) => {
            const query = `
                SELECT
                    (SELECT COUNT(*) FROM invites WHERE inviter = ? AND guild = ?) AS total,
                    (SELECT COUNT(*) FROM leaves WHERE inviter = ? AND guild = ? AND fake = 0) AS leaves,
                    (SELECT SUM(bonus) FROM bonus WHERE user = ? AND guild = ?) AS bonus,
                    (SELECT COUNT(*) FROM invites WHERE inviter = ? AND guild = ? AND fake = 1) AS fake
            `;

            connection.mysql.query(query, [inviter, guild, inviter, guild, inviter, guild, inviter, guild], (error: MysqlError | null, results: Array<InviteResults>) => {
                if (error) reject(error);

                const inviteStats = results[0];
                const { total = 0, leaves = 0, bonus = 0, fake = 0 } = inviteStats;

                const invites = total - leaves + (bonus ?? 0) - fake;

                resolve({
                    total,
                    invites,
                    leaves,
                    fake,
                    bonus: bonus ?? 0
                });
            });
        });
    },

    getWhoUsed(code: string, guild: Snowflake): Promise<WhoUsed> {
        return new Promise<WhoUsed>((resolve, reject) => {
            const query = `
                SELECT * FROM invites WHERE guild = ? AND code = ?
            `;

            connection.mysql.query(query, [guild, code], (error: MysqlError | null, results: Array<InviteResultsRow>) => {
                if (error) reject(error);
                const members: WhoUsed = {};
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    members[result.user] = result.fake === 1;
                }
                resolve(members);
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} user
     * @param {Snowflake} inviter
     * @param {Snowflake} guild
     * @param {string} code
     * @param {number} fake
     * @returns {void}
     * @throws {MysqlError}
     */
    add(user: Snowflake, inviter: Snowflake, guild: Snowflake, code: string, fake: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const queries = [
                `SELECT * FROM leaves WHERE user = ? AND guild = ? AND inactive = 0`,
                `UPDATE leaves SET inactive = 1 WHERE id = ?`,
                `INSERT INTO invites (user, guild, inviter, code, fake, inactive) VALUES (?, ?, ?, ?, ?, 0)`
            ];

            connection.mysql.beginTransaction((error: MysqlError | null) => {
                if (error) reject(error);
                connection.mysql.query(queries[0], [inviter, guild], (error1: MysqlError | null, results: Array<InviteResultsRow>) => {
                    if (error1) reject(error1);
                    if (results && results[0]) {
                        connection.mysql.query(queries[1], [results[0].id], (error2: MysqlError | null) => {
                            if (error2) {
                                connection.mysql.rollback(() => {
                                    reject(error2)
                                });
                            }
                        });
                    }
                    connection.mysql.query(queries[2], [user, guild, inviter, code, fake], (error2: MysqlError | null) => {
                        if (error2) {
                            connection.mysql.rollback(() => {
                                reject(error2);
                            });
                        }
                        connection.mysql.commit((error3: MysqlError | null) => {
                            if (error3) {
                                connection.mysql.rollback(() => {
                                    reject(error3);
                                });
                            }
                            resolve();
                        });
                    });
                });
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} inviter
     * @param {Snowflake} guild
     * @returns {void}
     * @throws {MysqlError}
     */
    clear(inviter: Snowflake, guild: Snowflake): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const queries = [
                `DELETE FROM invites WHERE inviter = ? AND guild = ?`,
                `DELETE FROM leaves WHERE inviter\ = ? AND guild = ?`,
                `DELETE FROM bonus WHERE user = ? AND guild = ?`
            ];

            connection.mysql.beginTransaction((error: MysqlError | null) => {
                if (error) reject(error);
                connection.mysql.query(queries[0], [inviter, guild], (error1: MysqlError | null) => {
                    if (error1) {
                        connection.mysql.rollback(() => {
                            reject(error1);
                        });
                    }
                    connection.mysql.query(queries[1], [inviter, guild], (error2: MysqlError | null) => {
                        if (error2) {
                            connection.mysql.rollback(() => {
                                reject(error2);
                            });
                        }
                        connection.mysql.query(queries[2], [inviter, guild], (error3: MysqlError | null) => {
                            if (error3) {
                                connection.mysql.rollback(() => {
                                    reject(error3);
                                })
                            }
                            connection.mysql.commit((error4: MysqlError | null) => {
                                if (error4) {
                                    connection.mysql.rollback(() => {
                                        reject(error4);
                                    });
                                }
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} user
     * @param {Snowflake} inviter
     * @param {Snowflake} guild
     * @returns {void}
     * @throws {MysqlError}
     */
    remove(user: Snowflake, inviter: Snowflake, guild: Snowflake): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const queries = [
                `SELECT * FROM invites WHERE user = ? AND guild = ? AND inactive = 0`,
                `UPDATE invites SET inactive = 1 WHERE id = ?`,
                `INSERT INTO leaves (user, guild, inviter, code, fake, inactive) VALUES (?, ?, ?, ?, ?, 0)`
            ];

            connection.mysql.beginTransaction((error: MysqlError | null) => {
                if (error) reject(error);
                connection.mysql.query(queries[0], [user, guild], (error1: MysqlError | null, results: Array<InviteResultsRow>) => {
                    if (error1) reject(error1);
                    if (results && results[0]) {
                        connection.mysql.query(queries[1], [results[0].id], (error2: MysqlError | null) => {
                            if (error2) {
                                connection.mysql.rollback(() => {
                                    reject(error2);
                                });
                            }
                        });
                        connection.mysql.query(queries[2], [user, guild, inviter, results[0].code, results[0].fake], (error3: MysqlError | null) => {
                            if (error3) {
                                connection.mysql.rollback(() => {
                                    reject(error3);
                                });
                            }
                            connection.mysql.commit((error4: MysqlError | null) => {
                                if (error4) {
                                    connection.mysql.rollback(() => {
                                        reject(error4);
                                    });
                                }
                                resolve();
                            });
                        });
                    } else reject(new Error("No inviter found"));
                });
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} user
     * @param {Snowflake} guild
     * @param {number} amount
     * @returns {void}
     * @throws {MysqlError}
     */
    bonus(user: Snowflake, guild: Snowflake, amount: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `
                INSERT INTO bonus (user, guild, bonus) VALUES (?, ?, ?)
            `;

            connection.mysql.query(query, [user, guild, amount], (error: MysqlError | null) => {
                if (error) reject(error);
                resolve();
            });
        });
    },

    /**
     *
     * @function
     * @param {Snowflake} guild
     * @returns {LeaderboardStats}
     * @throws {MysqlError}
     */
    leaderboard(guild: Snowflake): Promise<LeaderboardStats> {
        return new Promise<LeaderboardStats>((resolve, reject) => {
            const query = `
                SELECT 
                    i.inviter, 
                    COALESCE(i.total_invites, 0) - COALESCE(l.total_leaves, 0) + COALESCE(b.total_bonus, 0) AS total 
                FROM 
                    (SELECT inviter, COUNT(inviter) - SUM(fake) AS total_invites FROM invites WHERE guild = ? AND fake = 0 GROUP BY inviter) AS i
                    LEFT JOIN (SELECT inviter, COUNT(inviter) AS total_leaves FROM leaves WHERE guild = ? AND fake = 0 GROUP BY inviter) AS l ON i.inviter = l.inviter
                    LEFT JOIN (SELECT user, SUM(bonus) AS total_bonus FROM bonus WHERE guild = ? GROUP BY user) AS b ON i.inviter = b.user
            `;

            connection.mysql.query(query, [guild, guild, guild], (error: MysqlError | null, results: Array<LeaderboardResults>) => {
                if (error) reject(error);
                const invites: LeaderboardStats = {};
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    invites[result.inviter] = result.total;
                }
                resolve(invites);
            });
        });
    }
}
