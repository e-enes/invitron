import {Events} from "discord.js";
import MyClient from "../ts/class/MyClient";
import {register} from "../utils/slashsync";
import channelsync from "../utils/channelsync";
import connection from "../data/connection";
import config from "../config";

export default {
    once: true,
    name: Events.ClientReady,
    async execute(client: MyClient) {
        await register(client,
            client.register.map((command) => ({
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

            const channels = await channelsync.getChannels(guild.id);
            client.cache.set(guild.id, channels);

            const guildInvites = await guild.invites.fetch();
            const code = new Map();
            guildInvites.each((inv) => code.set(inv.code, inv.uses));
            client.invites.set(guild.id, code);
        }
    }
}
