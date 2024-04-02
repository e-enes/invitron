import { DMChannel, Events, NonThreadGuildBasedChannel } from "discord.js";
import { ChannelType } from "discord-api-types/v10";

import Listener from "../Listener.js";

class ChannelUpdate extends Listener {
  public constructor() {
    super(Events.ChannelUpdate);
  }

  public override async execute(oldChannel: DMChannel | NonThreadGuildBasedChannel, newChannel: DMChannel | NonThreadGuildBasedChannel) {
    const { database } = this.client;

    if (oldChannel.type !== ChannelType.GuildText || newChannel.type !== ChannelType.GuildText) {
      return;
    }

    const data = await database.query("SELECT active FROM channels WHERE channel_id = ?", [oldChannel.id]).catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    const active = data[0].active;

    if (active !== newChannel.viewable) {
      await database.query("UPDATE channels SET active = ? WHERE channel_id = ?", [newChannel.viewable, oldChannel.id]).catch(() => void 0);
    }
  }
}

export default ChannelUpdate;
