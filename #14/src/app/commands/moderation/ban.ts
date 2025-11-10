import type { ChatInputCommand, MessageCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, GuildMember, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';

export const command: CommandData = {
  name: 'ban',
  description: "Bane um membro",
  default_member_permissions: PermissionFlagsBits.BanMembers.toString(),
  contexts: [InteractionContextType.Guild],
  options: [
    {
        name: 'membro',
        description: 'O membro que deseja banir',
        required: true,
        type: ApplicationCommandOptionType.Mentionable
    },
    {
        name: 'motivo',
        description: 'O motivo da banimento',
        required: true,
        type: ApplicationCommandOptionType.String
    }, 
    {
        name: 'silencioso',
        description: 'Se deve ser anunciado',
        required: false,
        type: ApplicationCommandOptionType.Boolean
    }
  ]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {
        
        if (!ctx.guild) throw new Error;
        
        const membro = ctx.options.getMember('membro');
        const motivo = ctx.options.getString('motivo');
        const silencioso = ctx.options.getBoolean('silencioso');
        const autor = ctx.interaction.member;
        const bot = ctx.guild.members.me;

        if (!membro || !motivo || !autor || !bot || !(membro instanceof GuildMember) || !(autor instanceof GuildMember) || !(bot instanceof GuildMember)) throw new Error;

        if (!bot.permissions.has(PermissionFlagsBits.BanMembers)) {
            return ctx.interaction.reply({ content: "O bot não tem permissão para executar esse comando", flags: MessageFlags.Ephemeral });
        }

        const autorPosicaoCargo = autor.roles.highest.position;
        const membroPosicaoCargo = membro.roles.highest.position;
        const botPosicaoCargo = bot.roles.highest.position;

        if (autorPosicaoCargo <= membroPosicaoCargo) {
            return ctx.interaction.reply({ content: "Você não pode banir alguém que tenha um cargo igual ou superior ao seu.", flags: MessageFlags.Ephemeral });
        }

        if (botPosicaoCargo <= membroPosicaoCargo) {
            return ctx.interaction.reply({ content: "Eu não posso banir alguém que tenha um cargo igual ou superior ao meu.", flags: MessageFlags.Ephemeral });
        }

        await membro.ban({ reason: motivo, deleteMessageSeconds: 60 * 60 * 12});

        if (silencioso) {
            ctx.interaction.reply({ content: `Você baniu o membro ${membro} pelo motivo ${motivo}`, flags: MessageFlags.Ephemeral });
        } else {
            ctx.interaction.reply({ content: `O membro ${membro} foi banido por ${autor} pelo motivo ${motivo}` });
        }


    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }

};

export const message: MessageCommand = async (ctx) => {

    try {
    
    if (!ctx.guild) throw new Error;
    const [ membroString, ...motivo] = ctx.args();
    const autor = ctx.message.member;
    const bot = ctx.guild.members.me;
    if (!membroString || !motivo) {
      try {
        autor?.send({ content: `Membro ou motivo inexistentes.`});
      } catch (error) {
      }
      return;
    }
    const membroId = parseInt(membroString.replace('@', '').replace('<', '').replace('>', '')).toString();
    if (!membroId || membroId.length != 18) {
      try {
        autor?.send({ content: `Membro inválido.`});
      } catch (error) {
      }
      return;
    }
    const membro = await ctx.guild.members.fetch(membroId);

    if (!membro || !motivo || !(membro instanceof GuildMember) || !autor || !bot || !(autor instanceof GuildMember) || !(bot instanceof GuildMember)) throw new Error();

    const autorPosicaoCargo = autor.roles.highest.position;
    const membroPosicaoCargo = membro.roles.highest.position;
    const botPosicaoCargo = bot.roles.highest.position;

    if (autorPosicaoCargo <= membroPosicaoCargo) {
      try {
        autor.send({ content: `Você não pode banir alguém que tenha um cargo igual ou superior ao seu.`});
      } catch (error) {
      }
      return;
    }

    if (botPosicaoCargo <= membroPosicaoCargo) {
      try {
        autor.send({ content: `Eu não posso banir alguém que tenha um cargo igual ou superior ao meu.`});
      } catch (error) {
      }
      return;
    }

    await membro.ban({reason: motivo.toString(), deleteMessageSeconds: 60 * 60 * 12});

    ctx.message.reply({ content: `O membro ${membro} foi banido por ${autor} pelo motivo ${motivo}`});

  } catch (error) {
    try {
      ctx.message.member?.send({ content: `Occoreu um erro ao executar o seu comando`});
    } catch (error) { 
    }
    console.error(error);
  }

};
