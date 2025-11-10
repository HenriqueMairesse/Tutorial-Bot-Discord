import blacklistPalavrasSchema from '@/app/schemas/blacklistPalavrasSchema';
import type { EventHandler } from 'commandkit';

const handler: EventHandler<'messageUpdate'> = async (oldMessage, newMessage, client) => {

    try {

        if (!newMessage.guild) return;

        const blacklistPalavras = await blacklistPalavrasSchema.findOne({ guildID: newMessage.guild.id });
        if (!blacklistPalavras) return;

        blacklistPalavras.palavras.forEach(async p => {
            if (newMessage.content.includes(p)) {
                await newMessage.reply(`${newMessage.author} editou uma mensagem contendo uma palavra proibida!`);
                await newMessage.delete();
                return;
            }
        });
        
    } catch (error: any) {
        console.error("Erro no evento messageCreate/blacklistPalavrasAtualizadas.ts: \n" + error.message);
    }


}

export default handler;