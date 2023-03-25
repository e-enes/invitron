import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import InviteStats from "../ts/interface/InviteStats";
import invitesync from "../utils/invitesync";
import undefMember from "../security/undefMember";

export default {
    name: "invites",
    description: "View invitations",
    options: [
        {
            name: "member",
            description: "Mention a server member",
            type: ApplicationCommandOptionType.Mentionable,
            required: false
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        const member: GuildMember = interaction.options.get("member")?.member as GuildMember || interaction.member as GuildMember;
        if (member === undefined) return undefMember(interaction, client);

        try {
            const invites: InviteStats = await invitesync.getInvites(member.id, interaction.commandGuildId!);

            const embed = new EmbedBuilder()
                .setTitle("Invitation Stats")
                .setDescription(
                    `${interaction.member!.user.id === member.user.id ?
                        `Congratulations, **${member.user.tag}**! You have **${invites.invites}** invitations. \n\n_Here's a breakdown of your invitations:_\n\n**${invites.total}** Regular Invitations\n**${invites.leaves}** Left Invitations\n**${invites.bonus}** Bonus Invitations` :
                        `**${member.user.tag}** has **${invites.invites}** invitations. \n\n_Here's a breakdown of their invitations:_\n\n**${invites.total}** Regular Invitations\n**${invites.leaves}** Left Invitations\n**${invites.bonus}** Bonus Invitations`
                    }`
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
                        `Unable to retrieve your invitations, **${member.user.tag}**.` :
                        `Unable to retrieve invitations from **${member.user.tag}** for **${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}**.`
                    }
                    `
                )
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkRed")
            return interaction.editReply({embeds: [embed]});
        }
    }
}
