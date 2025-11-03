import type { EventHandler } from 'commandkit';
import config from 'config.json';
import { EmbedBuilder } from 'discord.js';

const handler: EventHandler<'messageDelete'> = async (message, client) => {


    try {

        if (message.partial) {
            await message.fetch();
        }

        if (!message.guild) return;
        if (message.author && message.author.bot) return;
        const canal = await message.guild.channels.fetch(config.canalLogs);
        if (!canal || !canal.isSendable()) {
            console.error("Canal logs não definido");
            return;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: message.author ? message.author.displayName : "Autor Desconhecido", iconURL: message.author ? message.author.avatarURL() ?? undefined : undefined})
            .setDescription(message.content)
            .setTitle("Mensagem Deletada")
            .setColor("Red")
            .addFields([
                {name: "Channel", value: `<#${message.channelId}>`}
            ])
            .setFooter({text: message.id})
            .setTimestamp(Date.now());

        canal.send({embeds: [embed]});
        
    } catch (error: any) {
        console.error("Erro no evento messageDelete/log.ts: \n" + error.message);
    }


}

export default handler;