import { EmbedBuilder, Events, Interaction } from "discord.js";
import i18next from "i18next";

import Listener from "../Listener.js";

import Command from "../../commands/Command.js";
import CommandKeys from "../../commands/Keys.js";
import Component from "../../components/Component.js";
import ComponentKeys from "../../components/Keys.js";

class InteractionCreate extends Listener {
  public constructor() {
    super(Events.InteractionCreate);
  }

  public override async execute(interaction: Interaction<"cached">) {
    if (interaction.isCommand() || interaction.isAutocomplete()) {
      await this.handleCommand(interaction);
    }

    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      await this.handleComponent(interaction);
    }
  }

  private async handleCommand(interaction: Command.Autocomplete | Command.ChatInput | Command.ContextMenu) {
    const { database, config } = this.client;

    const command = this.client.commands.find((command) =>
      command.applicationCommands.some((data) => data.name === interaction.commandName)
    );

    if (!command) {
      return;
    }

    if (interaction.isCommand()) {
      if (!interaction.guild) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${config.message.emojis.error} Error!`)
              .setDescription("You can only use my commands in the server.")
              .setFooter({ text: config.message.footer.text, iconURL: config.message.footer.icon })
              .setColor(config.message.colors.error),
          ],
          ephemeral: true,
        });

        return;
      }

      const data = await database.query("SELECT language FROM guilds WHERE guild_id = ?", [interaction.guild.id]);

      const keys = new CommandKeys();
      keys.language = data?.[0]?.language ?? "en";

      if (interaction.isChatInputCommand()) {
        command.executeChatInput?.(interaction, keys);
      }

      if (interaction.isContextMenuCommand()) {
        command.executeContextMenu?.(interaction, keys);
      }

      if (interaction.isUserContextMenuCommand()) {
        command.executeUserContextMenu?.(interaction, keys);
      }

      if (interaction.isMessageContextMenuCommand()) {
        command.executeMessageContextMenu?.(interaction, keys);
      }
    } else {
      command.executeAutocomplete?.(interaction);
    }
  }

  private async handleComponent(interaction: Component.Button | Component.SelectMenu | Component.Modal) {
    const { database, config } = this.client;

    const splitted = interaction.customId.split(":");
    const [key, ...references] = splitted;

    const component = this.client.components.get(key);

    if (!component) {
      return;
    }

    const data = await database.query("SELECT language FROM guilds WHERE guild_id = ?", [interaction.guild.id]);

    const keys = new ComponentKeys(...references);
    keys.language = data?.[0]?.language ?? "en";

    const userId = keys.entries[keys.entries.length - 1];
    const user = await this.client.users
      .fetch(userId)
      .then(() => true)
      .catch(() => false);

    if (user) {
      if (interaction.user.id !== userId) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `${config.message.emojis.error} ${i18next.t("components.insufficient_permission.title", { lng: keys.language })}`
              )
              .setDescription(i18next.t("components.insufficient_permission.description", { lng: keys.language }))
              .setColor(config.message.colors.error),
          ],
          ephemeral: true,
        });

        return;
      }
    }

    if (interaction.isButton()) {
      component.executeButton?.(interaction, keys);
    }

    if (interaction.isAnySelectMenu()) {
      component.executeSelectMenu?.(interaction, keys);
    }

    if (interaction.isStringSelectMenu()) {
      component.executeStringSelectMenu?.(interaction, keys);
    }

    if (interaction.isChannelSelectMenu()) {
      component.executeChannelSelectMenu?.(interaction, keys);
    }

    if (interaction.isMentionableSelectMenu()) {
      component.executeMentionableSelectMenu?.(interaction, keys);
    }

    if (interaction.isModalSubmit()) {
      component.executeModal?.(interaction, keys);
    }
  }
}

export default InteractionCreate;
