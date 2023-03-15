import connection from "../data/connection";
import InviteStats from "../ts/interface/InviteStats";
import InviteResults from "../ts/interface/InviteResults";
import BonusResults from "../ts/interface/BonusResults";
import {Snowflake} from "discord.js";

export default {
    async getInviter(user: Snowflake, guild: Snowflake): Promise<Snowflake> {
        return new Promise<Snowflake>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`invites\` WHERE \`user\` = \"${user}\" AND \`guild\` = \"${guild}\" AND \`inactive\` = \"false\"`, (error: Error, results: Array<InviteResults> | undefined) => {
                if (error) reject(error.message);
                if (results && results[0]) resolve(results[0].inviter);
                reject(new Error("No results found."));
            });
        });
    },
    async getInvites(inviter: Snowflake, guild: Snowflake): Promise<InviteStats> {
        return new Promise<InviteStats>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`invites\` WHERE \`inviter\` = "${inviter}" AND \`guild\` = "${guild}"`, (error: Error, results: Array<InviteResults>) => {
                if (error) reject(error.message);
                connection.mysql.query(`SELECT * FROM \`leaves\` WHERE \`inviter\` = "${inviter}" AND \`guild\` = "${guild}"`, (error1: Error, results1: Array<InviteResults>) => {
                    if (error1) reject(error1.message);
                    connection.mysql.query(`SELECT * FROM \`bonus\` WHERE \`user\` = "${inviter}" AND \`guild\` = "${guild}"`, (error2: Error, results2: Array<BonusResults>) => {
                        if (error2) reject(error2.message);
                        resolve({
                            total: results.length,
                            invites: results.length - results1.length + eval(results2.map((x) => x.bonus).join("+") || "parseInt(\"0\")"),
                            leaves: results1.length,
                            bonus: eval(results2.map((x) => x.bonus).join("+") || "parseInt(\"0\")")
                        });
                    });
                });
            });
        });
    },
    async setInviter(user: Snowflake, inviter: Snowflake, guild: Snowflake): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`leaves\` WHERE \`user\` = "${user}" AND \`guild\` = "${guild}" AND \`inactive\` = "false"`, (error: Error, results: Array<InviteResults>) => {
                if (error) reject(error.message);
                if (results[0]) {
                    connection.mysql.query(`UPDATE \`leaves\` SET \`inactive\` = "true" WHERE \`id\` = "${results[0].id}"`, (error1: Error) => {
                        if (error1) reject(error1.message);
                    });
                    connection.mysql.query(`INSERT INTO \`invites\` (\`user\`, \`guild\`, \`inviter\`, \`inactive\`) VALUES ("${user}", "${guild}", "${inviter}", "false")`, (error1: Error) => {
                        if (error1) reject(error1.message);
                        resolve(undefined);
                    });
                }
            });
        });
    },
    async clearInvites(inviter: Snowflake, guild: Snowflake): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            connection.mysql.query(`DELETE FROM \`invites\` WHERE \`inviter\` = \"${inviter}\" AND \`guild\` = \"${guild}\"`, (error: Error) => {
                if (error) reject(error.message);
                connection.mysql.query(`DELETE FROM \`leaves\` WHERE \`inviter\` = \"${inviter}\" AND \`guild\` = \"${guild}\"`, (error1: Error) => {
                    if (error1) reject(error1.message);
                    connection.mysql.query(`DELETE FROM \`bonus\` WHERE \`user\` = \"${inviter}\" AND \`guild\` = \"${guild}\"`, (error2: Error) => {
                        if (error2) reject(error2.message);
                        resolve(undefined);
                    });
                });
            });
        });
    },
    async removeInvite(user: Snowflake, inviter: Snowflake, guild: Snowflake): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`invites\` WHERE \`user\` = \"${user}\" AND \`guild\` = \"${guild}\" AND \`inactive\` = \"false\"`, (error: Error, results: Array<InviteResults>) => {
                if (error) reject(error.message);
                if (results[0]) {
                    connection.mysql.query(`UPDATE \`invites\` SET \`inactive\` = \"true\" WHERE \`id\` = \"${results[0].id}\"`, (error1: Error) => {
                        if (error1) reject(error1.message);
                    });
                }
                connection.mysql.query(`INSERT INTO \`leaves\` (\`user\`, \`guild\`, \`inviter\`, \`inactive\`) VALUES (\"${user}\", \"${guild}\", \"${inviter}\", \"false\")`, (error1: Error) => {
                    if (error1) reject(error1.message);
                    resolve(undefined);
                });
            });
        });
    },
    async bonusInvites(user: Snowflake, guild: Snowflake, amount: number): Promise<undefined> {
        return new Promise<undefined>((resolve, reject) => {
            connection.mysql.query(`INSERT INTO \`bonus\` (\`user\`, \`guild\`, \`bonus\`) VALUES (\"${user}\", \"${guild}\", \"${amount}\")`, (error: Error) => {
                if (error) reject(error.message);
                resolve(undefined);
            });
        });
    },
    async leaderboard(guild: Snowflake): Promise<{ [key: Snowflake]: number }> {
        return new Promise<{ [key: Snowflake]: number }>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`invites\` WHERE \`guild\` = \"${guild}\"`, (error: Error, results: Array<InviteResults>) => {
                if (error) reject(error.message);
                connection.mysql.query(`SELECT * FROM \`leaves\` WHERE \`guild\` = \"${guild}\"`, (error1: Error, results1: Array<InviteResults>) => {
                    if (error1) reject(error1.message);
                    connection.mysql.query(`SELECT * FROM \`bonus\` WHERE \`guild\` = \"${guild}\"`, (error2: Error, results2: Array<BonusResults>) => {
                        if (error2) reject(error2.message);
                        const invites: { [key: Snowflake]: number } = {};
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            invites[result.inviter] ? invites[result.inviter]++ : invites[result.inviter] = 1;
                        }
                        for (let i = 0; i < results1.length; i++) {
                            const result = results1[i];
                            invites[result.inviter] ? invites[result.inviter]-- : invites[result.inviter] = 0;
                        }
                        for (let i = 0; i < results2.length; i++) {
                            const result = results2[i];
                            invites[result.user] ? invites[result.user] += result.bonus : invites[result.user] = result.bonus;
                        }
                        resolve(invites);
                    });
                });
            });
        });
    }
};
