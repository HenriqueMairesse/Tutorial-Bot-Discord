import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';
import { EmbedBuilder, GuildMember } from 'discord.js';
import { canalBoasVindasID } from '../../../../config.json'

const handler: EventHandler<'guildMemberAdd'> = async (member: GuildMember) => {

    try {

        const embedBoasVindas = new EmbedBuilder()
            .setTitle(`Bem vindo ao servidor ${member.guild.name}!`)
            .setDescription(`Espero que se divirta durante sua estadia!`)
            .setAuthor({ name: member.user.username, iconURL: member.avatarURL() ?? undefined })
            .addFields([
                { name: "Membros:", value: `${member.guild.memberCount}` }
            ])
            .setFooter({ text: "Bem vindo" })
            .setTimestamp(Date.now())
            .setThumbnail(member.guild.iconURL())
            .setColor("Green");
        
        const canal = await member.guild.channels.fetch(canalBoasVindasID);
        if (!canal || !canal.isTextBased()) {
            throw new Error("Id do canal não configurado ou não é um canal de texto!");
        }
        canal.send({ embeds: [embedBoasVindas], content: `||${member}||`});

    } catch (error: any) {
        console.error("Erro no evento welcome.ts: \n" + error.message);
    }
};

export default handler;
