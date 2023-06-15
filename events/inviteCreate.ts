import {
    Events,
    Invite
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";

export default {
    once: false,
    name: Events.InviteCreate,
    async execute(invite: Invite, client: MyClient) {
        if (invite.inviter?.bot) return;

        client.cache.invites.get(invite.guild?.id!)!.set(invite.code, {
            uses: invite.uses!,
            memberId: invite.inviter?.id!
        });
    }
}
