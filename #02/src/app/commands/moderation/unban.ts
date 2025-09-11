import type { ChatInputCommand, MessageCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, GuildMember, MessageFlags, PermissionFlagsBits } from 'discord.js';

export const command: CommandData = {
  name: 'unban',
  description: "Retira o ban de um membro",
  default_member_permissions: PermissionFlagsBits.BanMembers.toString(),
  dm_permission: false,
  options: [
    {
        name: 'membro',
        description: 'O membro que deseja retirar o ban',
        required: true,
        type: ApplicationCommandOptionType.Mentionable
    },
    {
        name: 'motivo',
        description: 'O motivo da retirada do ban',
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
        
        const membro = ctx.options.getUser('membro');
        const motivo = ctx.options.getString('motivo');
        const silencioso = ctx.options.getBoolean('silencioso');
        const bot = ctx.guild.members.me;

        if (!membro || !motivo || !bot || !(bot instanceof GuildMember) || !ctx.interaction.member) throw new Error;

        if (!bot.permissions.has(PermissionFlagsBits.BanMembers)) {
            ctx.interaction.reply({ content: "O bot não tem permissão para executar esse comando", flags: MessageFlags.Ephemeral });
        }

        try {
            await ctx.guild.bans.fetch(membro.id);
        } catch (error: any) {
            if (error.code === 10026) {
                return ctx.interaction.reply({ content: "O membro não está banido", flags: MessageFlags.Ephemeral });
            }
            throw new Error;
        }

        await ctx.guild.members.unban(membro);

        if (silencioso) {
            ctx.interaction.reply({ content: `Você retirou o ban do membro ${membro} pelo motivo ${motivo}`, flags: MessageFlags.Ephemeral });
        } else {
            ctx.interaction.reply({ content: `O membro ${membro} teve o ban removido por ${ctx.interaction.member} pelo motivo ${motivo}` });
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

    try {
        await ctx.guild.bans.fetch(membro.id);
    } catch (error: any) {
        if (error.code === 10026) {
            return autor.send({ content: "O membro não está banido" });
        }
        throw new Error;
    }

    await ctx.guild.members.unban(membro);

    ctx.message.reply({ content: `O membro ${membro} foi banido por ${autor} pelo motivo ${motivo}`});

  } catch (error) {
    try {
      ctx.message.member?.send({ content: `Occoreu um erro ao executar o seu comando`});
    } catch (error) { 
    }
    console.error(error);
  }

    
};
