import {
    ApplicationCommandType,
    CommandInteraction, EmbedBuilder,
    GuildMember,
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import config from "../config";
import linkSync from "../lib/sync/link";

export default {
    name: "create-invite",
    description: "Create an invitation link that never expires",
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        const member: GuildMember = interaction.member as GuildMember;
        const links = client.cache.links.get(interaction.guild!.id)!;

        if (Array.from(links.values()).includes(member.user.id)) {
            const code = Array.from(links.entries()).find(([code, memberId]) => memberId === member.user.id)!;
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${member.user.username}** you already **have** an invitation link (*${code[0]}*)`)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("Red")
            return interaction.editReply({ embeds: [embed] })
        }

        interaction.guild?.invites.create(interaction.channel!.id, {
            maxAge: 0,
            temporary: false,
            unique: false
        }).then((inv) => {
            client.cache.invites.get(interaction.guild!.id)!.set(inv.code, {
                uses: inv.uses!,
                memberId: member.user.id
            });

            try {
                linkSync.add(member.user.id, interaction.guild!.id, inv.code);
            } catch (error: any) {
                inv.delete("Unsaved invitation");

                const embed = new EmbedBuilder()
                    .setTitle("Error!")
                    .setDescription(`${member} unable to **save** invitation code.`)
                    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                    .setColor("Red")
                if (config.handleError) embed.addFields({ name: "Console", value: error.message })
                return interaction.editReply({ embeds: [embed] });
            }
            links.set(inv.code, member.user.id);
            client.cache.links.set(interaction.guild!.id, links);

            const embed = new EmbedBuilder()
                .setTitle("Success!")
                .setDescription(`**${member.user.username}** your invitation **link** for this server is *${inv.code}*`)
                .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
                .setColor("DarkGreen")
            return interaction.editReply({ embeds: [embed] })
        });
    }
}
