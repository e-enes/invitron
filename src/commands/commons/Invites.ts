import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Invites extends Command {
  public constructor() {
    super("invites");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitations")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View invitation")
            .setDescriptionLocalizations(subcommands!.view.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.view.options!.member.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation to a member")
            .setDescriptionLocalizations(subcommands!.add.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.add.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to add")
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation to a member")
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.remove.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to remove")
                .setDescriptionLocalizations(subcommands!.remove.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("reset")
            .setDescription("Reset a member's invitations")
            .setDescriptionLocalizations(subcommands!.reset.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.reset.options!.member.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Create an invitation link that never expires")
            .setDescriptionLocalizations(subcommands!.create.description)
            .addStringOption((option) =>
              option
                .setName("source")
                .setDescription("Set a source")
                .setDescriptionLocalizations(subcommands!.create.options!.source.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("check")
            .setDescription("Discover which members hava utilized this code or identify the member associated with it")
            .setDescriptionLocalizations(subcommands!.check.description)
            .addStringOption((option) =>
              option
                .setName("code")
                .setDescription("Code (without discord.gg/)")
                .setDescriptionLocalizations(subcommands!.check.options!.code.description)
                .setRequired(false)
            )
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.check.options!.member.description)
                .setRequired(false)
            )
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { config } = this.client;

    if (!interaction.options.getSubcommand()) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t("commands.unknown_command.title", { lng: keys.language })}`)
            .setDescription(i18next.t("commands.unknown_command.description", { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await this[interaction.options.getSubcommand()](interaction, keys);
  }

  private async create(interaction: Command.ChatInput, keys: Command.Keys) {
    await interaction.deferReply({
      ephemeral: true,
    });

    const member = interaction.member as GuildMember;
    const { database, config } = this.client;

    const source = interaction.options.get("source")?.value as string;

    const data = await database.query("SELECT link, source FROM links WHERE member_id = ? AND guild_id = ?", [
      member.user.id,
      interaction.guild!.id,
    ]);

    if (data && data.length !== 0) {
      if (source && data[0].source !== source) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.updated_link.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`commands.${this.name}.messages.updated_link.description`, {
                  lng: keys.language,
                  link: data[0].link,
                  source: source,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`invites:${data[0].link}:${source.replace(" ", "-")}:${interaction.member!.user.id}`)
                .setLabel(i18next.t(`components.${this.name}.button.update.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Danger)
            ),
          ],
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.existed_link.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`commands.${this.name}.messages.existed_link.description`, { lng: keys.language, link: data[0].link })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      }

      return;
    }

    const invite = await interaction
      .guild!.invites.create(interaction.channel!.id, {
        maxAge: 0,
        temporary: false,
        unique: true,
      })
      .catch(() => {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.unable_create_link.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`commands.${this.name}.messages.unable_create_link.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });

    if (!invite) {
      return;
    }

    await database
      .query("INSERT INTO links (guild_id, member_id, link, source) VALUES (?, ?, ?, ?)", [
        interaction.guild!.id,
        member.user.id,
        invite.code,
        source ? source : null,
      ])
      .then(() => {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.success_link.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_link.description`, { lng: keys.language, link: invite.code })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        this.client.invites.get(interaction.guild!.id)!.set(invite.code, {
          member: member.user.id,
          uses: 0,
          source: source ? source : undefined,
        });
      })
      .catch(() => {
        invite.delete().catch(() => void 0);

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.error_link.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`commands.${this.name}.messages.error_link.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });
  }
}

export default Invites;
