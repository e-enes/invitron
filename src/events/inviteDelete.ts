import { Events, Invite } from "discord.js";

import Client from "../client";
import linkSync from "../utils/link";

export default {
  once: false,
  name: Events.InviteDelete,
  async execute(invite: Invite, client: Client): Promise<void> {
    const guildId = invite.guild!.id;
    const code = invite.code;
    const link = client.getLink(guildId, invite.inviter!.id);

    client.deleteInvite(guildId, code);

    if (link != undefined) {
      await linkSync.del(guildId, code);
      client.deleteLink(guildId, code);
    }
  },
};
