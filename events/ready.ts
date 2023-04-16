import {Events} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import {register} from "../lib/sync/slash";
import channelSync from "../lib/sync/channel";
import connection from "../database/connection";
import config from "../config";

export default {
    once: true,
    name: Events.ClientReady,
    async execute(client: MyClient) {
        await register(client,
            client.cache.register.map((command) => ({
                name: command.name,
                description: command.description,
                options: command.options,
                type: command.type,
            }))
        );
        await connection.executeQueries();

        client.user!.setActivity({name: config.activity.name, type: config.activity.type});

        for (let i = 0; i < client.guilds.cache.size; i++) {
            const guild = client.guilds.cache.at(i)!;

            const channels = await channelSync.getChannels(guild.id);
            client.cache.channels.set(guild.id, channels);

            const guildInvites = await guild.invites.fetch();
            const code = new Map();
            guildInvites.each((inv) => code.set(inv.code, inv.uses));
            client.cache.invites.set(guild.id, code);
        }
    }
}
