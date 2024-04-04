import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder } from "discord.js";
import i18next from "i18next";

import Component from "../Component.js";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";

class Fake extends Component {
  public constructor() {
    super("fake");
  }

  public override async executeButton(interaction: Component.Button, keys: Component.Keys) {
    const { database, config } = this.client;

    const data = await database.query(
      "SELECT role_id, custom_profile_pic, older, own_invite, first_join, back_original_inviter FROM fakes WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    let query: string | undefined;
    let [row] = data;

    if (!row) {
      row = {};
      query = "INSERT INTO fakes (role_id, guild_id) VALUES (null, ?)";
    } else {
      query = "UPDATE fakes SET role_id = null WHERE guild_id = ?";
    }

    row.role_id = null;

    await database
      .query(query, [interaction.guild.id])
      .then(async () => {
        const configuration = `Specific Role: ${row?.role_id ? `✅ (<@&${row.role_id}>)` : "❌"}\nCustom Avatar: ${row?.custom_profile_pic ? "✅" : "❌"}\nAged Account: ${row?.older ? `✅ (\`${row.older}\`d)` : "❌"}\nNo Self-Invite: ${row?.own_invite ? "✅" : "❌"}\nSingle Count: ${row?.first_join ? "✅" : "❌"}\nReturn Invite: ${row?.back_original_inviter ? "✅" : "❌"}`;

        await interaction.message
          .fetchReference()
          .then((message) => {
            message.edit({
              embeds: [
                EmbedBuilder.from(message.embeds[0]).setDescription(
                  i18next.t(`commands.${this.key}.messages.dropdown.description`, { lng: keys.language, configuration })
                ),
              ],
            });
          })
          .catch(() => void 0);

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.success.description`, { lng: keys.language }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.error.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  public override async executeStringSelectMenu(interaction: Component.StringSelectMenu, keys: Component.Keys) {
    const { database, config } = this.client;

    const [selected] = interaction.values;

    const data = await database.query(
      "SELECT role_id, custom_profile_pic, older, own_invite, first_join, back_original_inviter FROM fakes WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    let query: string | undefined;
    let [row] = data;

    if (selected === "role_id") {
      const components: any[] = [
        new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
          new RoleSelectMenuBuilder()
            .setCustomId(`fake:${interaction.member.user.id}`)
            .setPlaceholder(i18next.t(`components.${this.key}.selectMenu.placeholder`, { lng: keys.language }))
            .setMaxValues(1)
        ),
      ];

      if (row?.role_id) {
        components.push(
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setLabel(i18next.t(`components.${this.key}.button.disable.label`, { lng: keys.language }))
              .setStyle(ButtonStyle.Danger)
              .setCustomId("fake")
          )
        );
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t(`components.${this.key}.messages.role.title`, { lng: keys.language })}`)
            .setDescription(i18next.t(`components.${this.key}.messages.role.description`, { lng: keys.language }))
            .setColor(config.message.colors.success)
            .withDefaultFooter(),
        ],
        components,
        ephemeral: true,
      });

      return;
    } else if (selected === "older") {
      await interaction.showModal(
        new ModalBuilder()
          .setCustomId("fake")
          .setTitle("Aged Account")
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setLabel(i18next.t(`components.${this.key}.modal.older.label`, { lng: keys.language }))
                .setCustomId("older")
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(3)
                .setRequired(true)
            )
          )
      );

      return;
    }

    if (!row) {
      row = {};
      query = `INSERT INTO fakes (${selected}, guild_id) VALUES (?, ?)`;
    } else {
      query = `UPDATE fakes SET ${selected} = ? WHERE guild_id = ?`;
    }

    row[selected] = !row?.[selected];

    await database
      .query(query, [row[selected], interaction.guild.id])
      .then(async () => {
        const configuration = `Specific Role: ${row?.role_id ? `✅ (<@&${row.role_id}>)` : "❌"}\nCustom Avatar: ${row?.custom_profile_pic ? "✅" : "❌"}\nAged Account: ${row?.older ? `✅ (\`${row.older}\`d)` : "❌"}\nNo Self-Invite: ${row?.own_invite ? "✅" : "❌"}\nSingle Count: ${row?.first_join ? "✅" : "❌"}\nReturn Invite: ${row?.back_original_inviter ? "✅" : "❌"}`;

        await interaction.message
          .edit({
            embeds: [
              EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
                i18next.t(`commands.${this.key}.messages.dropdown.description`, { lng: keys.language, configuration })
              ),
            ],
          })
          .catch(() => void 0);

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.success.description`, { lng: keys.language }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.error.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  public override async executeRoleSelectMenu(interaction: Component.RoleSelectMenu, keys: Component.Keys) {
    const { database, config } = this.client;

    const data = await database.query(
      "SELECT role_id, custom_profile_pic, older, own_invite, first_join, back_original_inviter FROM fakes WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    let query: string | undefined;
    let [row] = data;

    if (!row) {
      row = {};
      query = "INSERT INTO fakes (role_id, guild_id) VALUES (?, ?)";
    } else {
      query = "UPDATE fakes SET role_id = ? WHERE guild_id = ?";
    }

    row.role_id = interaction.values[0];

    await database
      .query(query, [interaction.values[0], interaction.guild.id])
      .then(async () => {
        const configuration = `Specific Role: ${row?.role_id ? `✅ (<@&${row.role_id}>)` : "❌"}\nCustom Avatar: ${row?.custom_profile_pic ? "✅" : "❌"}\nAged Account: ${row?.older ? `✅ (\`${row.older}\`d)` : "❌"}\nNo Self-Invite: ${row?.own_invite ? "✅" : "❌"}\nSingle Count: ${row?.first_join ? "✅" : "❌"}\nReturn Invite: ${row?.back_original_inviter ? "✅" : "❌"}`;

        await interaction.message
          .fetchReference()
          .then((message) => {
            message.edit({
              embeds: [
                EmbedBuilder.from(message.embeds[0]).setDescription(
                  i18next.t(`commands.${this.key}.messages.dropdown.description`, { lng: keys.language, configuration })
                ),
              ],
            });
          })
          .catch(() => void 0);

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.success.description`, { lng: keys.language }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.error.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  public override async executeModal(interaction: Component.Modal, keys: Component.Keys) {
    const { database, config } = this.client;

    const data = await database.query(
      "SELECT role_id, custom_profile_pic, older, own_invite, first_join, back_original_inviter FROM fakes WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    let query: string | undefined;
    let [row] = data;

    if (!row) {
      row = {};
      query = "INSERT INTO fakes (older, guild_id) VALUES (null, ?)";
    } else {
      query = "UPDATE fakes SET older = ? WHERE guild_id = ?";
    }

    if (isNaN(Number(interaction.fields.getTextInputValue("older"))) || Number(interaction.fields.getTextInputValue("older")) < 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t(`components.${this.key}.messages.older_nan.title`, { lng: keys.language })}`)
            .setDescription(i18next.t(`components.${this.key}.messages.older_nan.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    row.older = Number(interaction.fields.getTextInputValue("older"));

    await database
      .query(query, [interaction.guild.id])
      .then(async () => {
        const configuration = `Specific Role: ${row?.role_id ? `✅ (<@&${row.role_id}>)` : "❌"}\nCustom Avatar: ${row?.custom_profile_pic ? "✅" : "❌"}\nAged Account: ${row?.older ? `✅ (\`${row.older}\`d)` : "❌"}\nNo Self-Invite: ${row?.own_invite ? "✅" : "❌"}\nSingle Count: ${row?.first_join ? "✅" : "❌"}\nReturn Invite: ${row?.back_original_inviter ? "✅" : "❌"}`;

        await interaction.message!.edit({
          embeds: [
            EmbedBuilder.from(interaction.message!.embeds[0]).setDescription(
              i18next.t(`commands.${this.key}.messages.dropdown.description`, { lng: keys.language, configuration })
            ),
          ],
        });

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.success.description`, { lng: keys.language }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(i18next.t(`components.${this.key}.messages.error.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Fake;
