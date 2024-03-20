import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Ping extends Command {
  public constructor() {
    super("ping");
  }

  public override initialize() {
    const { description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("View bot latency")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput) {
    const message = await interaction.reply({
      embeds: [new EmbedBuilder().setTitle("Pinging...").setColor(this.client.config.message.colors.success)],
    });

    await message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle("Pong!")
          .setDescription(
            [
              `API: \`${message.createdTimestamp - interaction.createdTimestamp}\`ms`,
              `Heartbeat: \`${this.client.ws.ping}\`ms`,
              `Database: \`${await this.client.database.ping()}\`ms`,
            ].join("\n")
          )
          .setColor(this.client.config.message.colors.success),
      ],
    });
  }
}

export default Ping;
