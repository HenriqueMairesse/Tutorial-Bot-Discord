import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';

const handler: EventHandler<'clientReady'> = async (client) => {
  Logger.info(`Logado como: ${client.user.username}!`);
};

export default handler;
