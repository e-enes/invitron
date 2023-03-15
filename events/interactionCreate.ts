import {Interaction} from 'discord.js';
import MyClient from "../ts/class/MyClient";
import {run} from "../buttons/ban-bot";

export default {
    once: false,
    name: 'interactionCreate',
    async execute(interaction: Interaction, client: MyClient) {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith("ban-bot-")) return run(interaction, client);

            const {default: btn} = await import(`../buttons/${interaction.customId}`)
            btn.run(interaction, client);
        }

        if (interaction.isCommand()) {
            const {default: cmd} = await import(`../commands/${interaction.commandName}`);
            cmd.run(interaction, client);
        }
    }
};
