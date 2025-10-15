import type { EventHandler } from 'commandkit';
import config from 'config.json';
import { EmbedBuilder } from 'discord.js';

const handler: EventHandler<'messageUpdate'> = async (oldMessage, newMessage, client) => {

    try {

        if (!newMessage.guild) return;
        if (newMessage.author.bot) return;
        const canal = await newMessage.guild.channels.fetch(config.canalLogs);
        if (!canal || !canal.isSendable()) {
            console.error("Canal logs não definido");
            return;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: newMessage.author.displayName, iconURL: newMessage.author.avatarURL() ?? undefined})
            .setDescription(oldMessage.content)
            .setTitle("Mensagem Atualizada")
            .setColor("Yellow")
            .addFields([
                {name: "Mensagem", value: newMessage.url}
            ])
            .setFooter({text: newMessage.id})
            .setTimestamp(Date.now());

        canal.send({embeds: [embed]});

        
    } catch (error: any) {
        console.error("Erro no evento messageUpdate/log.ts: \n" + error.message);
    }


}

export default handler;