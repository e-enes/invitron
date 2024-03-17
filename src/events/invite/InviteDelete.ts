import { Events, Invite } from "discord.js";

import Listener from "../Listener.js";

class InviteDelete extends Listener {
  public constructor() {
    super(Events.InviteDelete);
  }

  public override async execute(invite: Invite) {
    this.client.invites.get(invite.guild!.id)?.delete(invite.code);

    const customInvite = await this.client.database.query("SELECT link FROM links WHERE guild_id = ? AND link = ?", [
      invite.guild!.id,
      invite.code,
    ]);

    if (customInvite.length !== 0) {
      await this.client.database.query("DELETE FROM links WHERE guild_id = ? and link = ?", [
        invite.guild!.id,
        invite.code,
      ]);
    }
  }
}

export default InviteDelete;
