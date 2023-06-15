import { GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import "dotenv/config.js";
import MyClient from "./lib/types/class/MyClient";

const client = new MyClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans
    ],
    partials: [
        Partials.GuildMember
    ]
});

readdirSync("./events").forEach(async (file) => {
    if (!file.endsWith(".js")) return;

    const { default: event } = await import(`./events/${file}`);
    event.once ?
        client.once(event.name, () => event.execute(client)) :
        client.on(event.name, (...args) => event.execute(...args, client));
});

readdirSync("./commands").forEach(async (file) => {
    if (!file.endsWith(".js")) return;

    const { default: props } = await import(`./commands/${file}`);
    client.cache.register.push(props);
});

client.login(process.env.TOKEN);
