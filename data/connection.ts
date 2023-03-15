import {createConnection, Connection} from "mysql";

const options = {
    host: process.env.HOST,
    port: process.env.PORT || 3306,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

const uri = `mysql://${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;

const mysql: Connection = createConnection(uri);

export default {
    mysql,
    async executeQueries(): Promise<void> {
        const queries = [
            `CREATE TABLE IF NOT EXISTS \`invites\` (
                \`id\` int(11) PRIMARY KEY AUTO_INCREMENT,
                \`user\` int(11) NOT NULL,
                \`guild\` int(11) NOT NULL,
                \`inviter\` int(11) NOT NULL,
                \`inactive\` boolean NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS \`leaves\` (
                \`id\` int(11) PRIMARY KEY AUTO_INCREMENT,
                \`user\` int(11) NOT NULL,
                \`guild\` int(11) NOT NULL,
                \`inviter\` int(11) NOT NULL,
                \`inactive\` boolean NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS \`bonus\` (
                \`id\` int(11) PRIMARY KEY AUTO_INCREMENT,
                \`user\` int(11) NOT NULL,
                \`guild\` int(11) NOT NULL,
                \`bonus\` int(11) NOT NULL
            );`,
        ];

        for (let query of queries) {
            try {
                await mysql.query(query);
            } catch (error) {
                console.log(error);
            }
        }
    }
}
