import {
    ApplicationCommandOptionType, ApplicationCommandType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import undefMember from "../security/undefMember";
import noPermission from "../security/noPermission";
import invitesync from "../utils/invitesync";

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
            await invitesync.clearInvites(member.user.id, interaction.commandGuildId!);

            const embed = new EmbedBuilder()
                .setTitle("Invitation Reset")
                .setDescription(
                    `
                ${user.user.id === member.user.id ?
                        `**${user.user.tag}** your invitations have been **reset**` :
                        `**${user.user.tag}** has reset **${member.user.tag}**'s invitations.`
                    }
                `
                )
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(
                    `
                    ${interaction.member!.user.id === member.user.id ?
                        `**${user.user.tag}** unable to **reset** your invitations.` :
                        `**${user.user.tag}** was unable to **reset** **${member.user.tag}**'s invitations.`
                    }
                    `
                )
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkRed")
            return interaction.editReply({embeds: [embed]});
        }
    }
}
