import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChannelSelectMenuBuilder,
  Collection,
  Embed,
  EmbedBuilder,
  GuildTextBasedChannel,
  MessageActionRowComponent,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
} from "discord.js";
import { ButtonStyle, ChannelType, TextInputStyle } from "discord-api-types/v10";
import i18next from "i18next";

import Component from "../Component.js";

class Setup extends Component {
  private messages: Collection<string, Array<{ embeds: Embed[]; components: ActionRow<MessageActionRowComponent>[] }>>;

  public constructor() {
    super("setup");
    this.messages = new Collection();
  }

  public override async executeStringSelectMenu(interaction: Component.StringSelectMenu, keys: Component.Keys) {
    const { database, config } = this.client;

    await interaction.deferUpdate();

    const interactionKey = this.getInteractionKey(interaction);

    if (!this.messages.has(interactionKey)) {
      this.messages.set(interactionKey, []);

      setTimeout(() => this.messages.delete(interactionKey), 10 * 60 * 1000);
    }

    const [key] = keys.entries;

    if (key === "default") {
      const [selected] = interaction.values;

      this.messages.get(interactionKey)?.push({ embeds: interaction.message.embeds, components: interaction.message.components });

      if (selected === "language") {
        await interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_language_1.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_language_1.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`setup:language:${interaction.member.user.id}`)
                .setPlaceholder(i18next.t(`components.${this.key}.selectMenu.placeholder`, { lng: keys.language }))
                .setOptions(
                  {
                    label: "English",
                    value: "en",
                  },
                  {
                    label: "Français",
                    value: "fr",
                  },
                  {
                    label: "Nederlands",
                    value: "nl",
                  },
                  {
                    label: "Русский",
                    value: "ru",
                  },
                  {
                    label: "Tiếng Việt",
                    value: "vi",
                  }
                )
                .setMaxValues(1)
            ),
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.back.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });
      } else if (selected === "channel") {
        await interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_channel_1.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_channel_1.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId(`setup:join:${interaction.member.user.id}`)
                .setPlaceholder(i18next.t(`components.${this.key}.selectMenu.placeholder`, { lng: keys.language }))
                .setChannelTypes(ChannelType.GuildText)
                .setMaxValues(1)
            ),
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.back.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });
      } else if (selected === "role") {
        await interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_role_1.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_role_1.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
              new RoleSelectMenuBuilder()
                .setCustomId(`setup:role:${interaction.member.user.id}`)
                .setPlaceholder(i18next.t(`components.${this.key}.selectMenu.placeholder`, { lng: keys.language }))
                .setMaxValues(1)
            ),
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.back.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });
      } else if (selected === "fake") {
        await interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_fake_1.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_fake_1.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.confirm.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      } else if (selected === "leaderboard") {
        await interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_leaderboard_1.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_leaderboard_1.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.confirm.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      }
    } else if (key === "language") {
      const [language] = interaction.values;

      await database.query("UPDATE guilds SET language = ? WHERE guild_id = ?", [language, interaction.guild!.id]).then(() => {
        interaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.stage_language_2.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.stage_language_2.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`setup:back:${interaction.member.user.id}`)
                .setLabel(i18next.t(`components.${this.key}.button.confirm.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      });
    }
  }

  public override async executeButton(interaction: Component.Button, keys: Component.Keys) {
    const [key] = keys.entries;

    if (key === "back") {
      await this.previousMessage(interaction, keys);
    } else if (key === "same") {
      await this.executeChannelSelectMenu(interaction, keys);
    }
  }

  public override async executeChannelSelectMenu(interaction: Component.ChannelSelectMenu | Component.Button, keys: Component.Keys) {
    const { database, config } = this.client;

    let [key] = keys.entries;
    let channel: GuildTextBasedChannel | null | undefined;

    if (interaction instanceof ButtonInteraction) {
      key = "leave";
      channel = (interaction.guild.channels.cache.get(keys.entries[1]) ??
        (await interaction.guild.channels.fetch(keys.entries[1]).catch(() => undefined))) as GuildTextBasedChannel;
    } else {
      channel = interaction.channels.first() as GuildTextBasedChannel;
    }

    if (!channel || !channel.viewable) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`components.${this.key}.messages.invalid_channel.title`, { lng: keys.language }))
            .setDescription(i18next.t(`components.${this.key}.messages.invalid_channel.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await interaction.deferUpdate();

    const query = await database
      .query("SELECT 1 FROM channels WHERE guild_id = ? AND channel_type = ?", [interaction.guild!.id, key])
      .then((data) => {
        if (data.length === 0) {
          return "INSERT INTO channels (channel_id, guild_id, channel_type) VALUES (?, ?, ?)";
        }

        return "UPDATE channels SET channel_id = ? WHERE guild_id = ? AND channel_type = ?";
      });

    await database.query(query, [channel!.id, interaction.guild.id, key]).then(() => {
      let stage: number;

      const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
      const interactionKey = this.getInteractionKey(interaction);

      if (key === "join") {
        this.messages.get(interactionKey)?.push({ embeds: interaction.message.embeds, components: interaction.message.components });

        stage = 2;
        components.push(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId(`setup:leave:${interaction.member.user.id}`)
              .setPlaceholder(i18next.t(`components.${this.key}.selectMenu.placeholder`, { lng: keys.language }))
              .setChannelTypes(ChannelType.GuildText)
              .setMaxValues(1)
          ),
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(`setup:same:${channel!.id}:${interaction.member.user.id}`)
              .setLabel(i18next.t(`components.${this.key}.button.same.label`, { lng: keys.language }))
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`setup:back:${interaction.member.user.id}`)
              .setLabel(i18next.t(`components.${this.key}.button.back.label`, { lng: keys.language }))
              .setStyle(ButtonStyle.Secondary)
          )
        );
      } else {
        this.messages.get(interactionKey)?.pop();

        stage = 3;
        components.push(
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(`setup:back:${interaction.member.user.id}`)
              .setLabel(i18next.t(`components.${this.key}.button.confirm.label`, { lng: keys.language }))
              .setStyle(ButtonStyle.Primary)
          )
        );
      }

      interaction.message.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`components.${this.key}.messages.stage_channel_${stage}.title`, { lng: keys.language }))
            .setDescription(i18next.t(`components.${this.key}.messages.stage_channel_${stage}.description`, { lng: keys.language }))
            .setColor(config.message.colors.default)
            .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
            .withDefaultFooter(),
        ],
        components,
      });
    });
  }

  public override async executeRoleSelectMenu(interaction: Component.RoleSelectMenu, keys: Component.Keys) {
    const { config } = this.client;

    const role = interaction.roles.first()!;

    if (!role.editable) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`components.${this.key}.messages.invalid_role.title`, { lng: keys.language }))
            .setDescription(i18next.t(`components.${this.key}.messages.invalid_role.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await interaction.showModal(
      new ModalBuilder()
        .setTitle(i18next.t(`components.${this.key}.modal.invitation_role.title`, { lng: keys.language }))
        .setCustomId(`setup:${role.id}:${interaction.member.user.id}`)
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setLabel(i18next.t(`components.${this.key}.modal.invitation_role.label`, { lng: keys.language }))
              .setCustomId("invite")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("5")
              .setRequired(true)
              .setMaxLength(5)
          )
        )
    );
  }

  public override async executeModal(interaction: Component.Modal, keys: Component.Keys) {
    const { database, config } = this.client;

    await interaction.deferUpdate();

    const [roleId] = keys.entries;
    const requiredInvitations = interaction.fields.getTextInputValue("invite");

    const query = await database
      .query("SELECT 1 FROM roles WHERE guild_id = ? AND role_id = ?", [interaction.guild!.id, requiredInvitations])
      .then((data) => {
        if (data.length === 0) {
          return "INSERT INTO roles (role_id, number_invitations, guild_id) VALUES (?, ?, ?)";
        }

        return "UPDATE roles SET role_id = ? AND roles.number_invitations = ? WHERE guild_id = ?";
      });

    await database.query(query, [roleId, requiredInvitations, interaction.guild!.id]).then(() => {
      interaction.message!.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`components.${this.key}.messages.stage_role_2.title`, { lng: keys.language }))
            .setDescription(i18next.t(`components.${this.key}.messages.stage_role_2.description`, { lng: keys.language }))
            .setColor(config.message.colors.default)
            .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
            .withDefaultFooter(),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(`setup:back:${interaction.member.user.id}`)
              .setLabel(i18next.t(`components.${this.key}.button.confirm.label`, { lng: keys.language }))
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
    });
  }

  private getInteractionKey(interaction: Component.Button | Component.SelectMenu | Component.Modal) {
    return `${interaction.user.id}-${interaction.guildId}-${interaction.message!.id}`;
  }

  private async previousMessage(interaction: Component.Button | Component.SelectMenu | Component.Modal, keys: Component.Keys) {
    const { config } = this.client;

    const interactionKey = this.getInteractionKey(interaction);
    const historyStack = this.messages.get(interactionKey);

    if (historyStack && historyStack.length > 0) {
      await interaction.deferUpdate();

      const previousState = historyStack.pop();

      await interaction.message!.edit({
        embeds: previousState?.embeds,
        components: previousState?.components,
      });

      return;
    }

    this.messages.delete(interactionKey);

    await interaction.message
      ?.delete()
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.error_back.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.error_back.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.message?.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.error_back.title`, { lng: keys.language }))
              .setDescription(i18next.t(`components.${this.key}.messages.error_back.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          components: [],
        });
      });
  }
}

export default Setup;
