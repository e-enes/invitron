import {Snowflake} from "discord.js";
import connection from "../../database/connection";
import ChannelResults from "../types/interface/ChannelResults";
import ChannelStats from "../types/interface/ChannelStats";

export default {
    async setGuild(guild: Snowflake) {
        return new Promise<void>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`channels\` WHERE \`guild\` = "${guild}"`, (error: Error, results: Array<ChannelResults>) => {
                if (error) reject(error.message);
                if (results[0]) resolve();
                connection.mysql.query(`INSERT INTO \`channels\` (\`setup\`, \`guild\`, \`welcome\`, \`leave\`, \`log\`) VALUES ("0", "${guild}", "undefined", "undefined", "undefined")`, (error1: Error) => {
                    if (error1) reject(error1.message);
                    resolve();
                });
            });
        });
    },
    async setup(welcome: Snowflake, leave: Snowflake, log: Snowflake, guild: Snowflake) {
        return new Promise<void>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`channels\` WHERE \`guild\` = "${guild}"`, async (error: Error, results: Array<ChannelResults>) => {
                if (error) reject(error.message);
                if (results && results[0]) {
                    connection.mysql.query(`UPDATE \`channels\` SET \`setup\` = "1" AND \`welcome\` = "${welcome}" AND \`leave\` = "${leave}" AND \`log\` = "${log}" WHERE \`id\` = "${results[0].id}"`, (error1: Error) => {
                        if (error1) reject(error1.message);
                        resolve();
                    });
                } else {
                    connection.mysql.query(`INSERT INTO \`channels\` (\`setup\`, \`guild\`, \`welcome\`, \`leave\`, \`log\`) VALUES ("1", "${guild}", "${welcome}", "${leave}", "${log}")`, (error1: Error) => {
                        if (error1) reject(error1.message);
                        resolve();
                    });
                }
            });
        });
    },
    async getChannels(guild: Snowflake) {
        return new Promise<ChannelStats>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`channels\` WHERE \`guild\` = "${guild}"`, (error: Error, results: Array<ChannelResults>) => {
                if (error) reject(error.message);
                if (results && results[0]) {
                    resolve({
                        welcome: results[0].welcome,
                        leave: results[0].leave,
                        log: results[0].log
                    });
                }
            });
        });
    },
    async deleteChannel(welcome: boolean, leave: boolean, guild: Snowflake) {
        return new Promise<void>((resolve, reject) => {
            connection.mysql.query(`SELECT * FROM \`channels\` WHERE \`guild\` = "${guild}"`, (error: Error, results: Array<ChannelResults>) => {
                if (error) reject(error.message);
                if (results[0]) {
                    connection.mysql.query(`UPDATE \`channels\` SET \`setup\` = "0" ${welcome ? `AND \`welcome\` = "undefined"` : leave ? `AND \`leave\` = "undefined"` : `AND \`log\` = "undefined"`} WHERE \`id\` = "${results[0].id}"`, (error1: Error) => {
                        if (error1) reject(error1.message);
                        resolve();
                    });
                }
            });
        });
    }
}
