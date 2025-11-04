import type { ChatInputCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, GuildMember, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import ms, { StringValue } from 'ms';
import prettyMilliseconds from 'pretty-ms';

export const command: CommandData = {
    name: 'mute',
    description: 'Mute um membro',
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString(),
    contexts: [InteractionContextType.Guild],
    options: [
        {
            name: 'membro',
            description: 'O membro que deseja mutar.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'duração',
            description: 'A duração do mute (30m, 1h, 1d).',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'motivo',
            description: 'O motivo do mute',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'silencioso',
            description: 'Se deseja não exibir que o membro foi mutado',
            required: false,
            type: ApplicationCommandOptionType.Boolean,
        },
    ],
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {

        if (!ctx.guild) throw new Error;

        const membro = ctx.options.getMember('membro');
        const motivo = ctx.options.getString('motivo');
        const duracao = ctx.options.getString('duração') as StringValue;
        const silencioso = ctx.options.getBoolean('silencioso');
        const autor = ctx.interaction.member;
        const bot = ctx.guild.members.me;

        if (!membro || !motivo || !duracao || !autor || !bot || !(membro instanceof GuildMember) || !(autor instanceof GuildMember) || !(bot instanceof GuildMember)) throw new Error;
        if (!bot.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return ctx.interaction.reply({ content: "Eu não tenho a permissão necessária para isso.", flags: MessageFlags.Ephemeral });
        }

        if (!membro || !(membro instanceof GuildMember)) {
            return ctx.interaction.reply({ content: `O membro ${membro}, não está no servidor.`, flags: MessageFlags.Ephemeral });
        }

        if (membro.user.bot) {
            return ctx.interaction.reply({ content: `Eu não posso silenciar um bot.`, flags: MessageFlags.Ephemeral });
        }

        const autorPosicaoCargo = autor.roles.highest.position;
        const membroPosicaoCargo = membro.roles.highest.position;
        const botPosicaoCargo = bot.roles.highest.position;

        if (membroPosicaoCargo >= autorPosicaoCargo) {
            return ctx.interaction.reply({ content: `Você não pode silenciar o membro ${membro}, pois ele tem tem um cargo maior ou igual ao seu!`, flags: MessageFlags.Ephemeral });
        }

        if (membroPosicaoCargo >= botPosicaoCargo) {
            return ctx.interaction.reply({ content: `Eu não posso silenciar o membro ${membro}, pois ele tem tem um cargo maior ou igual ao meu!`, flags: MessageFlags.Ephemeral });
        }

        if (membro.isCommunicationDisabled()) {
            return ctx.interaction.reply({ content: `O membro ${membro} já está mutado, por favor aguarde o mute terminar para uma nova punição!`, flags: MessageFlags.Ephemeral });
        }

        const duracaoMs = ms(duracao);

        if (isNaN(duracaoMs)) {
            return ctx.interaction.reply({ content: "Por favor forneça um tempo válido.", flags: MessageFlags.Ephemeral });
        }

        if (duracaoMs < 5000 || duracaoMs > 2.419e9) {
            return ctx.interaction.reply({ content: "A duração da punição não pode ser menor que 5 segundos ou maior que 28 dias!", flags: MessageFlags.Ephemeral });
        }

        const duracaoFormatada = prettyMilliseconds(duracaoMs, { unitCount: 3});

        await membro.timeout(duracaoMs, motivo);

        if (silencioso) {
            ctx.interaction.reply({ content: `O membro ${membro} foi silenciado! \nRazão: ${motivo} \nDuração: ${duracaoFormatada}`, flags: MessageFlags.Ephemeral });
        } else {
            ctx.interaction.reply({ content: `O membro ${membro} foi silenciado! \nRazão: ${motivo} \nDuração: ${duracaoFormatada}` });
        }

    } catch (error: any) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }

};
