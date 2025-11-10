import blacklistSpamSchema from '@/app/schemas/blacklistSpamSchema';
import { type EventHandler } from 'commandkit';
const informacoes = new Map<string, InformacoesGuardadas>();

const handler: EventHandler<'messageCreate'> = async (message, client) => {

    try {

        if (!message.guild || message.author.bot) return;

        const blacklistSpam = await blacklistSpamSchema.findOne({ guildID: message.guild.id });
        if (!blacklistSpam) return;

        let dados = informacoes.get(message.author.id);
        let mensagemResposta = '';

        if (!dados) {
            dados = {
                qntdMensagem: 1,
                ultimaMensagem: Date.now()
            }
            informacoes.set(message.author.id, dados);
        } else {
            if (Date.now() - dados.ultimaMensagem < 1000 * 5) {
                if (dados.qntdMensagem > 4 && blacklistSpam.flood) {
                    mensagemResposta += `${message.author} está enviando muitas mensagens em pouco tempo! Por favor manere na quantidade!`;
                } else {
                    dados = {
                        qntdMensagem: dados.qntdMensagem + 1,
                        ultimaMensagem: Date.now(),
                    }
                    informacoes.set(message.author.id, dados);
                }
            } else {
                dados = {
                    qntdMensagem: 1,
                    ultimaMensagem: Date.now()
                }
                informacoes.set(message.author.id, dados);
            }

            if (blacklistSpam.links || blacklistSpam.caps) {

                const mensagemCoteudo = message.content.replace(/\s+/g, '');
                const qntdLink = (mensagemCoteudo.match(/https?:\/\/\S+/gi) || []).length;
                const qntdCapsLock = (mensagemCoteudo.match(/[A-Z]/g) || []).length;
                const porcentagemCapsLock = qntdCapsLock/mensagemCoteudo.length * 100;

                if (qntdLink > 0 && blacklistSpam.links) {
                    mensagemResposta += `\n${message.author} você não pode enviar links no servidor!`;
                }

                if (porcentagemCapsLock > 80 && mensagemCoteudo.length > 30 && blacklistSpam.caps) {
                    mensagemResposta += `\n${message.author} sua mensagem continha uma alta quantidade de caps lock! Por favor evite usa-lo!`;
                }

            }

            if ((message.mentions.members?.size ?? 0) > 2 && blacklistSpam.mentions) {
                mensagemResposta += `\n${message.author} sua mensagem menciona muitos membro, evite mencionar tantas pessoas!`;
            } 

            if (mensagemResposta.length > 0) {
                await message.reply(mensagemResposta);
                await message.delete();
            }

        }

        
    } catch (error: any) {
        console.error("Erro no evento messageCreate/blacklistSpamCriadas.ts: \n" + error.message);
    }


}

export default handler;

interface InformacoesGuardadas {
    qntdMensagem: number,
    ultimaMensagem: number,
}