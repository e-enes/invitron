import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { APIButtonComponent } from "discord-api-types/v10";
import i18next from "i18next";

import Component from "../Component.js";

class Roles extends Component {
  public constructor() {
    super("roles");
  }

  public override async executeButton(interaction: Component.Button, keys: Component.Keys) {
    const { database, config } = this.client;
    const [roleId, number] = keys.entries;

    await interaction.message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          ButtonBuilder.from(interaction.message.components[0].components[0] as APIButtonComponent).setDisabled(true)
        ),
      ],
    });

    const role = await interaction.guild.roles.fetch(roleId, { cache: true }).catch(() => null);
    const data = await database.query("SELECT role_id FROM roles WHERE role_id = ?", [roleId]);

    if (!role || data.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t(`components.${this.key}.messages.not_existed_role.title`, { lng: keys.language })}`)
            .setDescription(
              i18next.t(`components.${this.key}.messages.not_existed_role.description`, {
                lng: keys.language,
                role: roleId,
              })
            )
            .setColor(config.message.colors.warn)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await database
      .query("UPDATE roles SET number_invitations = ? WHERE role_id = ?", [number, roleId])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`components.${this.key}.messages.success.description`, {
                  lng: keys.language,
                  role: role.id,
                })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`components.${this.key}.messages.error.description`, {
                  lng: keys.language,
                  role: role.id,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Roles;
