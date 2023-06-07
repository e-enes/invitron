import {Events, Interaction, ChannelType, User, GuildMember} from 'discord.js';
import MyClient from "../lib/types/class/MyClient";
import {run} from "../buttons/ban-bots";
import noDMCommand from "../lib/utils/noDMCommand";

export default {
    once: false,
    name: Events.InteractionCreate,
    async execute(interaction: Interaction, client: MyClient) {
        if (interaction.channel?.type === ChannelType.DM) return noDMCommand(interaction.user, client)

        if (interaction.isButton()) {
            await interaction.deferReply();
            if (interaction.customId.startsWith("ban-bot-")) return run(interaction, client);

            const {default: btn} = await import(`../buttons/${interaction.customId}`)
            btn.run(interaction, client);
        }

        if (interaction.isCommand()) {
            await interaction.deferReply();

            const {default: cmd} = await import(`../commands/${interaction.commandName}`);
            cmd.run(interaction, client);
        }
    }
};
