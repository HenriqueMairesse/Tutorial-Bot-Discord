import blacklistPalavrasSchema from '@/app/schemas/blacklistPalavrasSchema';
import type { EventHandler } from 'commandkit';

const handler: EventHandler<'messageCreate'> = async (message, client) => {

    try {

        if (!message.guild) return;

        const blacklistPalavras = await blacklistPalavrasSchema.findOne({ guildID: message.guild.id });
        if (!blacklistPalavras) return;

        blacklistPalavras.palavras.forEach(async p => {
            if (message.content.includes(p)) {
                await message.reply(`${message.author} enviou uma mensagem contendo uma palavra proibida!`);
                await message.delete();
                return;
            }
        });
        
    } catch (error: any) {
        console.error("Erro no evento messageCreate/blacklistPalavrasCriadas.ts: \n" + error.message);
    }


}

export default handler;