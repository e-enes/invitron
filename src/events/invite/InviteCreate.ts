import { Events, Invite } from "discord.js";

import Listener from "../Listener.js";

class InviteCreate extends Listener {
  public constructor() {
    super(Events.InviteCreate);
  }

  public override async execute(invite: Invite) {
    if (invite.inviter?.bot) {
      return;
    }

    this.client.invites.get(invite.guild!.id)?.set(invite.code, { member: invite.inviter!.id, uses: invite.uses! });
  }
}

export default InviteCreate;
