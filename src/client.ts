import { Client, Collection, Partials } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";

import { loadCommands, loadComponents, loadEvents } from "./utils/loader.js";

import config from "./config.js";

import Sqlite from "./database/Sqlite.js";
import MySql from "./database/MySql.js";

import "./utils/translations/i18next.js";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
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

if (!client.config.message.footer.icon) {
  client.config.message.footer.icon = client.user!.displayAvatarURL({ forceStatic: true });
}

if (config.useSqlite) {
  const { glob } = await import("glob");
  const [file] = await glob("shared/db.sqlite");
  client.database = new Sqlite(file);
} else {
  client.database = new MySql(config.mysql);
}

await client.database.connect();

await loadEvents(client);
await loadCommands(client);
await loadComponents(client);

await client.login(process.env.BOT_TOKEN!);
