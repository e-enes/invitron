import { DMChannel, Events, NonThreadGuildBasedChannel } from "discord.js";
import { ChannelType } from "discord-api-types/v10";

import Listener from "../Listener.js";

class ChannelDelete extends Listener {
  public constructor() {
    super(Events.ChannelDelete);
  }

  public override async execute(channel: DMChannel | NonThreadGuildBasedChannel) {
    const { database } = this.client;

    if (channel.type !== ChannelType.GuildText) {
      return;
    }

    const data = await database.query("SELECT channel_id FROM channels WHERE channel_id = ?", [channel.id]).catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    await database.query("DELETE FROM channels WHERE channel_id = ?", [channel.id]).catch(() => void 0);
  }
}

export default ChannelDelete;
