import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';
import { ActivityOptions, ActivityType } from 'discord.js';
import mongoose from 'mongoose';

const handler: EventHandler<'clientReady'> = async (client) => {
    Logger.info(`Logado como: ${client.user.username}!`);

    const atividades: ActivityOptions[] = [
      { name: `${client.users.cache.size} membros`, type: ActivityType.Watching },
      { name: `${client.guilds.cache.size} guildas`, type: ActivityType.Competing },
    ]

    let contadoraAtividades = 0;

    setInterval(() => {

      const novaAtividade = atividades[contadoraAtividades];
      if (!novaAtividade) return;

      client.user.setPresence({ activities: [novaAtividade]});

      if (contadoraAtividades == atividades.length - 1) {
        contadoraAtividades = 0;
      } else {
        contadoraAtividades++;
      }

    }, 30 * 1000)

    /* Logger.info('Tentando se conectar a database..');
    try {
      if (!process.env.MONGODB) throw new Error();
        await mongoose.connect(process.env.MONGODB);
    } catch (error) {
      Logger.error('Não foi possível se conectar ao mongodb'); 
      process.exit();   
    }
    Logger.info('Conectado a database com sucesso.'); */

}

export default handler;