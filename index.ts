import {IntentsBitField, Partials} from "discord.js";
import {readdirSync} from "fs";
import "dotenv/config.js";
import MyClient from "./ts/class/MyClient";

const client = new MyClient({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember
    ]
});

readdirSync("./events").forEach(async (file) => {
    if (!file.endsWith(".js")) return;

    const {default: event} = await import(`./events/${file}`);
    event.once ?
        client.once(event.name, () => event.execute(client)) :
        client.on(event.name, (...args) => event.execute(...args, client));
});

readdirSync("./commands").forEach(async (file) => {
    if (!file.endsWith(".js")) return;

    const {default: props} = await import(`./commands/${file}`);
    client.register.push(props);
});

client.login(process.env.TOKEN).then(() => console.log(`login!`));

