import "dotenv/config.js";
import { ShardingManager } from "discord.js";

import config from "./config.js";
import Logger from "./utils/Logger.js";

const manager = new ShardingManager("dist/client.js", {
	token: config.token,
});

manager.on("shardCreate", (shard) => {
	Logger.info(`Created shard '${shard.id}'.`);
});

await manager.spawn();
