import { EmbedBuilder, GuildMember, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";
import i18next from "i18next";

class Channel extends Command {
  public constructor() {
    super("channel");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage join/leave channel")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("set")
            .setDescription("Set join/leave channel")
            .setDescriptionLocalizations(subcommands!.set.description)
            .addStringOption((option) =>
              option
                .setName("type")
                .setDescription("Choose the type of channel")
                .setDescriptionLocalizations(subcommands!.set.options!.type.description)
                .setChoices({ name: "Join", value: "join" }, { name: "Leave", value: "leave" })
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Choose the channel")
                .setDescriptionLocalizations(subcommands!.set.options!.channel.description)
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

    const member = interaction.member as GuildMember;

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t("commands.insufficient_permission.title", { lng: keys.language }))
            .setDescription(i18next.t("commands.insufficient_permission.description", { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const type = interaction.options.getString("type", true);
    const channel = interaction.options.getChannel("channel", true) as GuildTextBasedChannel;

    if (!channel.viewable) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_channel.title`, { lng: keys.language }))
            .setDescription(
              i18next.t(`commands.${this.name}.messages.invalid_channel.description`, { lng: keys.language, channel: channel.id })
            )
            .setColor(config.message.colors.default)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const query = await database
      .query("SELECT 1 FROM channels WHERE guild_id = ? AND channel_type = ?", [interaction.guild!.id, type])
      .then((data) => {
        if (data.length === 0) {
          return "INSERT INTO channels (channel_id, guild_id, channel_type) VALUES (?, ?, ?)";
        }

        return "UPDATE channels SET channel_id = ? WHERE guild_id = ? AND channel_type = ?";
      });

    await database
      .query(query, [channel.id, interaction.guild!.id, type])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_${type}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_${type}.description`, { lng: keys.language, channel: channel.id })
              )
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_${type}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_${type}.description`, { lng: keys.language, channel: channel.id })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Channel;
