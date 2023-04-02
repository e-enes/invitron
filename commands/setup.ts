import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
    CommandInteraction,
    EmbedBuilder
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import channelsync from "../utils/channelsync";
import invalidChannel from "../security/invalidChannel";
import config from "../config";

export default {
    name: "setup",
    description: "Setup the invitation system",
    options: [
        {
            name: "welcome-channel",
            description: "Set the welcome channel",
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: "leave-channel",
            description: "Set the leave channel",
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: "log-channel",
            description: "Set the log channel",
            type: ApplicationCommandOptionType.Channel,
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        const welcomeChannel = interaction.options.get("welcome-channel")?.channel!;
        if (welcomeChannel.type !== ChannelType.GuildText) return invalidChannel(interaction, client);

        const leaveChannel = interaction.options.get("leave-channel")?.channel!;
        if (leaveChannel.type !== ChannelType.GuildText) return invalidChannel(interaction, client);

        const logChannel = interaction.options.get("log-channel")?.channel!;
        if (logChannel.type !== ChannelType.GuildText) return invalidChannel(interaction, client);

        try {
            await channelsync.setup(welcomeChannel.id, leaveChannel.id, logChannel.id, interaction.guildId!);
            const channelCache = await channelsync.getChannels(interaction.guildId!);
            client.cache.set(interaction.guildId!, channelCache);

            const embed = new EmbedBuilder()
                .setTitle("Setup!")
                .setDescription(`**${interaction.member!.user.username + interaction.member!.user.discriminator}** the **setup was done** on this server!`)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${interaction.member!.user.username + interaction.member!.user.discriminator}** unable to **done setup** on this server`)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            config.handleError ?
                embed.addFields({name: "Console", value: error as string}) :
                console.error(error);
            return interaction.editReply({embeds: [embed]});
        }
    }
}
