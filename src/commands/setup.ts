import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
} from "discord.js";

import Client from "../client";
import channelSync from "../utils/channel";
import { noPermission, invalidChannel } from "../utils/messages";
import config from "../../config";

export default {
  name: "setup",
  description: "Setup the invitation system",
  options: [
    {
      name: "welcome-channel",
      description: "Set the welcome channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "leave-channel",
      description: "Set the leave channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "log-channel",
      description: "Set the log channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    const user: GuildMember = interaction.member as GuildMember;
    if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await noPermission(interaction, user, client);
      return;
    }

    const welcomeChannel = interaction.options.get("welcome-channel")!.channel!;
    const leaveChannel = interaction.options.get("leave-channel")!.channel!;
    const logChannel = interaction.options.get("log-channel")!.channel!;

    if (
      welcomeChannel.type !== ChannelType.GuildText ||
      leaveChannel.type !== ChannelType.GuildText ||
      logChannel.type !== ChannelType.GuildText
    ) {
      await invalidChannel(interaction, client);
      return;
    }

    try {
      await channelSync.set(
        welcomeChannel.id,
        leaveChannel.id,
        logChannel.id,
        interaction.guildId!
      );

      client.setChannels(interaction.guildId!, {
        setup: true,
        welcome: welcomeChannel.id,
        leave: leaveChannel.id,
        log: logChannel.id,
      });

      const embed = new EmbedBuilder()
        .setTitle("Setup!")
        .setDescription(`**${interaction.member}** the **setup was done** on this server!`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("DarkGreen");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${interaction.member}** unable to **done setup** on this server`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      if (config.handleError) {
        embed.addFields({ name: "Console", value: (error as Error).message });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
