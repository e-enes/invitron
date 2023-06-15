import { Events, Guild } from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import channelSync from "../lib/sync/channel";
import linkSync from "../lib/sync/link";

export default {
    once: false,
    name: Events.GuildCreate,
    async execute(guild: Guild, client: MyClient) {
        await channelSync.add(guild.id);
        const channels = await channelSync.get(guild.id);
        client.cache.channels.set(guild.id, channels);

        const guildInvites = await guild.invites.fetch();
        const code = new Map<string, { uses: number; memberId: string }>();

        const links = await linkSync.get(guild.id);
        const link = new Map<string, string>();

        for (const [key, value] of Object.entries(links)) {
            link.set(key, value);
        }
        client.cache.links.set(guild.id, link);
        const linksMap = await client.cache.links.get(guild.id)!;

        guildInvites.each((inv) => {
            const invCode = inv.code;
            const invUses = inv.uses!;
            const inviterId = linksMap?.has(invCode) ? linksMap.get(invCode)! : inv.inviter?.id!;

            code.set(invCode, { uses: invUses, memberId: inviterId });
        });

        client.cache.invites.set(guild.id, code);
    },
};
