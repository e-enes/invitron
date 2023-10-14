import { GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import "dotenv/config";

import Client from "./client";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.GuildMember],
});

readdirSync(path.join(__dirname, "events")).forEach(async file => {
  if (!file.endsWith(".js")) return;

  const { default: event } = await import(`./events/${file}`);

  if (event.once) {
    client.once(event.name, () => event.execute(client));
  } else client.on(event.name, (...args) => event.execute(...args, client));
});

readdirSync(path.join(__dirname, "commands")).forEach(async file => {
  if (!file.endsWith(".js")) return;

  const { default: cmd } = await import(`./commands/${file}`);
  client.setRegister(cmd);
});

client.login(process.env.TOKEN);
