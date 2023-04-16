import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField,
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import InviteStats from "../lib/types/interface/InviteStats";
import inviteSync from "../lib/sync/invite";
import undefMember from "../lib/utils/undefMember";
import noPermission from "../lib/utils/noPermission";
import invalidBonus from "../lib/utils/invalidBonus";
import config from "../config";

export default {
    name: "add-invites",
    description: "Add invitations to a member",
    options: [
        {
            name: "member",
            description: "Mention a server member",
            type: ApplicationCommandOptionType.Mentionable,
            required: true
        },
        {
            name: "number",
            description: "Number of invitations to add",
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
            const invites: InviteStats = await inviteSync.getInvites(member.user.id, interaction.guildId!);
            if (invites.bonus + bonus >= 2147483647) {
                const embed = new EmbedBuilder()
                    .setTitle("Error!")
                    .setDescription(`**${user.user.tag}** was unable to add invitations.\n\nThe total number of invitations has exceeded the maximum limit.`)
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red");
                return interaction.editReply({embeds: [embed]});
            }

            await inviteSync.bonusInvites(member.user.id, interaction.guildId!, bonus);
            const embed = new EmbedBuilder()
                .setTitle("Add Invitation")
                .setDescription(`
                    ${user.user.id === member.user.id ?
                    `**${member.user.tag}** you've earned **${bonus}** invitations!` :
                    `**${user.user.tag}** has added **${bonus}** invitations for **${member.user.tag}**`}
                `)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${user.user.tag}** was unable **to add invitations**.`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            if (config.handleError) embed.addFields({name: "Console", value: error as string})
            return interaction.editReply({embeds: [embed]});
        }
    }
}
