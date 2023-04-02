import {Events, Guild} from "discord.js";
import MyClient from "../ts/class/MyClient";
import channelsync from "../utils/channelsync";

export default {
    once: false,
    name: Events.GuildCreate,
    async execute(guild: Guild, client: MyClient) {
        await guild.invites.fetch()
            .then(async (guildInvites) => {
                const code = new Map;
                await guildInvites.each((inv) => code.set(inv.code, inv.uses));

                await client.invites.set(guild.id, code);
            });

        await channelsync.setGuild(guild.id);
        const channelCache = await channelsync.getChannels(guild.id);
        client.cache.set(guild.id, channelCache);
    }
}
