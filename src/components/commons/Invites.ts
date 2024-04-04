import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { APIButtonComponent } from "discord-api-types/v10";
import i18next from "i18next";

import Component from "../Component.js";

class Invites extends Component {
  public constructor() {
    super("invites");
  }

  public override async executeButton(interaction: Component.Button, keys: Component.Keys) {
    const { database, config } = this.client;
    const [link, preSource] = keys.entries;
    const source = preSource.replace("_", " ");

    const code = await interaction.guild.invites.fetch({ cache: true, code: link }).catch(() => null);
    const data = await database.query("SELECT link FROM links WHERE link = ?", [link]);

    await interaction.message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          ButtonBuilder.from(interaction.message.components[0].components[0] as APIButtonComponent).setDisabled(true)
        ),
      ],
    });

    if (!code || data.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`components.${this.key}.messages.not_existed_code.title`, { lng: keys.language }))
            .setDescription(
              i18next.t(`components.${this.key}.messages.not_existed_code.description`, {
                lng: keys.language,
                code: link,
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
      .query("UPDATE links SET source = ? WHERE link = ?", [source, link])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`components.${this.key}.messages.success.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`components.${this.key}.messages.success.description`, {
                  lng: keys.language,
                  code: link,
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
              .setTitle(i18next.t(`components.${this.key}.messages.error.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`components.${this.key}.messages.error.description`, {
                  lng: keys.language,
                  code: link,
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

export default Invites;
