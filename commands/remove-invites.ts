import {
    ApplicationCommandOptionType, ApplicationCommandType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField,
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import InviteStats from "../ts/interface/InviteStats";
import invitesync from "../utils/invitesync";
import undefMember from "../security/undefMember";
import noPermission from "../security/noPermission";
import invalidBonus from "../security/invalidBonus";
import config from "../config";

export default {
    name: "remove-invites",
    description: "Remove invitations from a member",
    options: [
        {
            name: "member",
            description: "Mention a server member",
            type: ApplicationCommandOptionType.Mentionable,
            required: true
        },
        {
            name: "number",
            description: "Number of invitations to remove",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        const user: GuildMember = interaction.member as GuildMember;
        if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) return noPermission(interaction, user, client);

        const member: GuildMember = interaction.options.get("member")?.member as GuildMember;
        if (member === undefined) return undefMember(interaction, client);

        const bonus = interaction.options.get("number")?.value as number;
        if (bonus <= 0 || bonus >= 2147483647) return invalidBonus(interaction, user, client);

        try {
            const invites: InviteStats = await invitesync.getInvites(member.user.id, interaction.guildId!);
            if (Math.abs(invites.bonus - bonus) >= 2147483647) {
                const embed = new EmbedBuilder()
                    .setTitle("Error!")
                    .setDescription(`**${user.user.tag}** was unable to add invitations.\n\nThe total number of invitations has exceeded the maximum limit.`)
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red")
                return interaction.editReply({embeds: [embed]});
            }

            await invitesync.bonusInvites(member.user.id, interaction.guildId!, -1 * Math.abs(bonus));
            const embed = new EmbedBuilder()
                .setTitle("Remove Invitation")
                .setDescription(`
                    ${user.user.id === member.user.id ?
                    `**${member.user.tag}** you've lost **${bonus}** invitations.` :
                    `**${user.user.tag}** has removed **${bonus}** invitations from **${member.user.tag}**`}
                `)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${user.user.tag}** was unable **to remove invitations**.`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            config.handleError ?
                embed.addFields({name: "Console", value: error as string}) :
                console.error(error);
            return interaction.editReply({embeds: [embed]});
        }
    }
}
