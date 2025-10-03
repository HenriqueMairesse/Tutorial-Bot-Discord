import type { ChatInputCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, GuildMember, InteractionContextType, MessageFlags, PermissionFlagsBits, TextChannel } from 'discord.js';

export const command: CommandData = {
    name: 'unmute',
    description: 'Retira o silenciamento de um membro',
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString(),
    contexts: [InteractionContextType.Guild],
    options: [
        {
            name: 'membro',
            description: 'O membro que deseja retirar o mute.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'motivo',
            description: 'O motivo de retirar o mute.',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'silencioso',
            description: 'Selecione se deseja não aparecer a mensagem de que o chat foi limpado',
            required: false,
            type: ApplicationCommandOptionType.Boolean,
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
        if (!bot.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return ctx.interaction.reply({ content: "Eu não tenho a permissão necessária para isso.", flags: MessageFlags.Ephemeral });
        }

        if (membro.user.bot) {
            return ctx.interaction.reply({ content: `Eu não posso retirar o mute de um bot.`, flags: MessageFlags.Ephemeral });
        }

        const autorPosicaoCargo = autor.roles.highest.position;
        const membroPosicaoCargo = membro.roles.highest.position;
        const botPosicaoCargo = bot.roles.highest.position;

        if (membroPosicaoCargo >= autorPosicaoCargo) {
            await ctx.interaction.reply({ content: `Você não pode retirar o mute do membro ${membro}, pois ele tem tem um cargo maior ou igual ao seu!`, flags: MessageFlags.Ephemeral });
        }

        if (membroPosicaoCargo >= botPosicaoCargo) {
            return ctx.interaction.reply({ content: `Eu não posso retirar o mute do membro ${membro}, pois ele tem tem um cargo maior ou igual ao meu!`, flags: MessageFlags.Ephemeral });
        }

        if (!membro.isCommunicationDisabled()) {
            return ctx.interaction.reply({ content: `O membro ${membro} não está mutado!`, flags: MessageFlags.Ephemeral });
        }

        await membro.timeout(null, motivo);

        if (silencioso) {
            ctx.interaction.reply({ content: `O membro ${membro} foi desmutado! \nRazão: ${motivo}`, flags: MessageFlags.Ephemeral });
        } else {
            ctx.interaction.reply({ content: `O membro ${membro} foi desmutado! \nRazão: ${motivo}` });
        }

    } catch (error: any) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }
};
