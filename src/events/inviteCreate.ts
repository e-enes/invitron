import { Events, Invite } from "discord.js";

import Client from "../client";

export default {
  once: false,
  name: Events.InviteCreate,
  async execute(invite: Invite, client: Client): Promise<void> {
    if (invite.inviter?.bot) return;

    client.setInvite(invite.guild!.id, invite.code, {
      uses: invite.uses!,
      memberId: invite.inviter!.id,
    });
  },
};
