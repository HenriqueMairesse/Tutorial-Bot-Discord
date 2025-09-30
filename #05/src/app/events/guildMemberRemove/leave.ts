import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';
import { EmbedBuilder, GuildMember, PartialGuildMember } from 'discord.js';
import { canalSaidaID } from '../../../../config.json'

const handler: EventHandler<'guildMemberRemove'> = async (member: GuildMember | PartialGuildMember) => {

    try {

        const embedBoasVindas = new EmbedBuilder()
            .setTitle(`${member.guild.name} saiu do servidor!`)
            .setDescription(`Que pena que o ${member} saiu do servidor, esperamos que volte em breve!`)
            .setAuthor({ name: member.user.username, iconURL: member.avatarURL() ?? undefined })
            .addFields([
                { name: "Membros:", value: `${member.guild.memberCount}` }
            ])
            .setFooter({ text: "Volte logo" })
            .setTimestamp(Date.now())
            .setThumbnail(member.guild.iconURL())
            .setColor("Red");
        
        const canal = await member.guild.channels.fetch(canalSaidaID);
        if (!canal || !canal.isTextBased()) {
            throw new Error("Id do canal não configurado ou não é um canal de texto!");
        }
        canal.send({ embeds: [embedBoasVindas], content: `||${member}||`});

    } catch (error: any) {
        console.error("Erro no evento leave.ts: \n" + error.message);
    }
};

export default handler;
