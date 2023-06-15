import {
    ApplicationCommandOptionType, ApplicationCommandType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import undefMember from "../lib/utils/undefMember";
import noPermission from "../lib/utils/noPermission";
import inviteSync from "../lib/sync/invite";
import config from "../config";

export default {
    name: "reset-invites",
    description: "Reset a member's invites to 0",
    options: [
        {
            name: "member",
            description: "Mention a server member",
            type: ApplicationCommandOptionType.Mentionable,
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        const user: GuildMember = interaction.member as GuildMember;
        if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) return noPermission(interaction, user, client);

        const member: GuildMember = interaction.options.get("member")?.member as GuildMember;
        if (member === undefined) return undefMember(interaction, client);

        try {
            await inviteSync.clear(member.user.id, interaction.guildId!);

            const embed = new EmbedBuilder()
                .setTitle("Invitation Reset")
                .setDescription(`
                    ${user.user.id === member.user.id ?
                        `**${user}** your invitations have been **reset**` :
                        `**${user}** has reset **${member}**'s invitations.`}
                `)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("DarkGreen")
            return interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`
                    ${interaction.member!.user.id === member.user.id ?
                        `**${user}** unable to **reset** your invitations.` :
                        `**${user}** was unable to **reset** **${member}**'s invitations.`}
                `)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("Red")
            if (config.handleError) embed.addFields({ name: "Console", value: error.message })
            return interaction.editReply({ embeds: [embed] });
        }
    }
}
