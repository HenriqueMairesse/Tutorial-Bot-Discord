import sorteioSchema from '@/app/schemas/sorteioSchema';
import giveawayRoll from '@/app/utils/giveawayRoll';
import type { EventHandler } from 'commandkit';
import config from 'config.json';

const handler: EventHandler<'clientReady'> = async (client) => {

    setInterval(async () => {

        const sorteios = await sorteioSchema.find({terminou: false, dataTermino: {$lte: Date.now()}});
        if (!sorteios || sorteios.length == 0) return;
        sorteios.forEach(async(sorteio) => {
            const guild = await client.guilds.fetch(sorteio.guildID);
            const canal = await guild.channels.fetch(config.canalSorteio);
            if (!canal || !canal.isSendable() || !guild) {
                sorteio.terminou = true;
                await sorteio.save();
                return;
            }
            const mensagem = await canal.messages.fetch(sorteio.messageID);
            if (!mensagem) {
                sorteio.terminou = true;
                await sorteio.save();
                return;
            }

            await canal.send(`Parabéns ${sorteio.ganhadores > 1 ? "aos ganhadores" : "ao ganhador" } do ${sorteio.premio}!\n${sorteio.ganhadores > 1 ? "Ganhadores" : "Ganhador" }: ${giveawayRoll(sorteio.participantes, sorteio.ganhadores)}`);
            sorteio.terminou = true;
            await sorteio.save();
        })

    }, 1000 * 30)

}

export default handler;