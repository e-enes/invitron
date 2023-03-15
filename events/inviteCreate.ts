import {Invite} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default {
    once: false,
    name: "inviteCreate",
    async execute(invite: Invite, client: MyClient) {
        await client.invites.get(invite.guild?.id!)?.set(invite.code, invite.uses!);
    }
};