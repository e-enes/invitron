import {
    Events,
    Invite
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import linkSync from "../lib/sync/link";

export default {
    once: false,
    name: Events.InviteDelete,
    async execute(invite: Invite, client: MyClient) {
        const guildId = invite.guild?.id!;
        const links = client.cache.links.get(guildId)!

        client.cache.invites.get(guildId)!.delete(invite.code);

        if (links.has(invite.code)) {
            await linkSync.del(guildId, invite.code);
            links.delete(invite.code);
            client.cache.links.set(guildId, links);
        }
    }
}
