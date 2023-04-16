import {
    Events,
    Guild
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import channel from "../lib/sync/channel";

export default {
    once: false,
    name: Events.GuildCreate,
    async execute(guild: Guild, client: MyClient) {
        await guild.invites.fetch()
            .then(async (guildInvites) => {
                const code = new Map;
                await guildInvites.each((inv) => code.set(inv.code, inv.uses));

                await client.cache.invites.set(guild.id, code);
            });

        await channel.setGuild(guild.id);
        const channels = await channel.getChannels(guild.id);
        client.cache.channels.set(guild.id, channels);
    }
}
