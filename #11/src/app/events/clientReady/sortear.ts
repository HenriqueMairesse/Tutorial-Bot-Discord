import sorteioSchema from '@/app/schemas/sorteioSchema';
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

            await canal.send(`Parabéns ao(s) ganhador(es) do ${sorteio.premio}!\nGanhadores: ${giveawayRoll(sorteio.participantes, sorteio.ganhadores)}`);
            sorteio.terminou = true;
            await sorteio.save();
        })

    }, 1000 * 30)

}

export default handler;

const giveawayRoll = (participants: string[], winners: number): string => {

  const validParticipants = participants.filter((p): p is string => !!p);

  const shuffledParticipants = [...validParticipants];
  let currentIndex = shuffledParticipants.length;
  let randomIndex;

  if (winners > validParticipants.length) {
    winners = validParticipants.length;
  }

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
  
    const aux = shuffledParticipants[randomIndex];
    const aux2 = shuffledParticipants[currentIndex];
    if (!aux || !aux2) throw new Error();
    shuffledParticipants[currentIndex] = aux;
    shuffledParticipants[randomIndex] = aux2;

  }

  if (winners == 1) {
    return `<@${shuffledParticipants[0]}>`;
  } 
  let participantsString: string = `<@${shuffledParticipants[0]}>`
  for (let i = 1; i < winners - 1; i++) {
    participantsString += `, <@${shuffledParticipants[i]}>`;
  }
  participantsString += ` e <@${shuffledParticipants[winners - 1]}>`;
  return participantsString;   
}