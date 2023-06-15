import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
    CommandInteraction,
    EmbedBuilder, GuildMember, PermissionsBitField
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import channelSync from "../lib/sync/channel";
import invalidChannel from "../lib/utils/invalidChannel";
import config from "../config";
import noPermission from "../lib/utils/noPermission";

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
        const user: GuildMember = interaction.member as GuildMember;
        if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) return noPermission(interaction, user, client);

        const welcomeChannel = interaction.options.get("welcome-channel")?.channel!;
        const leaveChannel = interaction.options.get("leave-channel")?.channel!;
        const logChannel = interaction.options.get("log-channel")?.channel!;

        if (welcomeChannel.type !== ChannelType.GuildText ||
            leaveChannel.type !== ChannelType.GuildText ||
            logChannel.type !== ChannelType.GuildText) return invalidChannel(interaction, client);

        try {
            await channelSync.set(welcomeChannel.id, leaveChannel.id, logChannel.id, interaction.guildId!);
            client.cache.channels.set(interaction.guildId!, {
                welcome: welcomeChannel.id,
                leave: leaveChannel.id,
                log: logChannel.id
            });

            const embed = new EmbedBuilder()
                .setTitle("Setup!")
                .setDescription(`**${interaction.member}** the **setup was done** on this server!`)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("DarkGreen")
            return interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${interaction.member}** unable to **done setup** on this server`)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("Red")
            if (config.handleError) embed.addFields({ name: "Console", value: error.message })
            return interaction.editReply({ embeds: [embed] });
        }
    }
}
