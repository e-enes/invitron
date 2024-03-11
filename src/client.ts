import { Client, Collection, Partials } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";

import { loadCommands, loadComponents, loadEvents } from "./utils/loader.js";

import "./utils/process.js";

import config from "./config.js";

import Sqlite from "./database/Sqlite.js";
import MySql from "./database/MySql.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
  ],
  allowedMentions: {
    repliedUser: false,
    parse: [],
  },
  partials: [Partials.GuildMember],
});

client.commands = new Collection();
client.components = new Collection();

client.config = config;

if (config.useSqlite) {
  client.database = new Sqlite();
} else {
  client.database = new MySql();
}

await loadEvents(client);
await loadCommands(client);
await loadComponents(client);

await client.login(process.env.BOT_TOKEN!);
