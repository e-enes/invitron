import {
    Events,
    Invite
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";

export default {
    once: false,
    name: Events.InviteCreate,
    async execute(invite: Invite, client: MyClient) {
        await client.cache.invites.get(invite.guild?.id!)?.set(invite.code, invite.uses!);
    }
}
