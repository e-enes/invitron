import { Events } from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import { register } from "../lib/sync/slash";
import channelSync from "../lib/sync/channel";
import connection from "../database/connection";
import config from "../config";
import { LinkStats } from "../lib/types/interface/invite";
import linkSync from "../lib/sync/link";

export default {
    once: true,
    name: Events.ClientReady,
    async execute(client: MyClient) {
        await register(client,
            client.cache.register.map((command) => ({
                name: command.name,
                description: command.description,
                options: command.options ?? undefined,
                type: command.type,
            }))
        );
        await connection.executeQueries();

        client.user!.setActivity({ name: config.activity.name, type: config.activity.type });

        for (let i = 0; i < client.guilds.cache.size; i++) {
            const guild = client.guilds.cache.at(i)!;

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
        }

        console.log("login!");
    }
}
