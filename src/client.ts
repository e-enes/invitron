import { Client, Collection, Partials, EmbedBuilder } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";

import { loadCommands, loadComponents, loadEvents } from "./utils/loader.js";
import ClientUtils from "./utils/ClientUtils.js";

import config from "./config.js";

import Sqlite from "./database/Sqlite.js";
import MySql from "./database/MySql.js";

import "./utils/translations/i18next.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
  ],
  allowedMentions: {
    repliedUser: false,
    parse: ["roles", "users"],
  },
  partials: [Partials.GuildMember, Partials.Channel],
});

client.invites = new Collection();
client.commands = new Collection();
client.components = new Collection();
client.utils = new ClientUtils(client);

client.config = config;

EmbedBuilder.prototype.withDefaultFooter = function (this: EmbedBuilder): EmbedBuilder {
  if (config.message.footer.text) {
    this.setFooter({ text: config.message.footer.text, iconURL: config.message.footer.icon });
  }

  if (config.message.timestamp) {
    this.setTimestamp();
  }

  return this;
};

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
