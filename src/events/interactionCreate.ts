import { Events, Interaction, ChannelType } from "discord.js";

import Client from "../client";
import { noDMCommand } from "../utils/messages";
import btnRun from "../buttons/ban-bots";

export default {
  once: false,
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: Client): Promise<void> {
    if (interaction.channel?.type === ChannelType.DM) {
      await noDMCommand(interaction.user, client);
      return;
    }

    if (interaction.isButton()) {
      await interaction.deferReply();

      if (interaction.customId.startsWith("ban-bots")) {
        await btnRun(interaction, client);
        return;
      }

      const { default: btn } = await import(`../buttons/${interaction.customId}`);
      btn.run(interaction, client);
      return;
    }

    if (interaction.isCommand()) {
      await interaction.deferReply();

      const { default: cmd } = await import(`../commands/${interaction.commandName}`);
      cmd.run(interaction, client);
    }
  },
};
