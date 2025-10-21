import { ChatInputCommand, CommandData } from "commandkit";
import { ApplicationCommandOptionType, InteractionContextType, MessageFlags, PermissionFlagsBits, TextChannel } from "discord.js";

export const command: CommandData = {
    name: 'clear',
    description: 'Limpa um número específico de mensagens no canal.',
    default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),
    contexts: [InteractionContextType.Guild],
    options: [
        {
            name: 'quantidade',
            description: 'Número de mensagens para apagar (entre 1 e 100).',
            required: true,
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'silencioso',
            description: 'Selecione se deseja não aparecer a mensagem de que o chat foi limpado',
            required: false,
            type: ApplicationCommandOptionType.Boolean,
        },
    ],
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {
    
        const quantidade = ctx.options.getNumber('quantidade');
        const silencioso = ctx.options.getBoolean('silencioso');
        if (!quantidade || !ctx.channel || !(ctx.channel instanceof TextChannel) || !ctx.guild || !ctx.guild.members.me) throw new Error;
        if (!ctx.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return ctx.interaction.reply({ content: "Eu não tenho a permissão necessária para isso.", flags: MessageFlags.Ephemeral });
        }

        if (isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
            return ctx.interaction.reply("Por favor, forneça um número válido de mensagens para apagar (entre 1 e 100).");
        }

        const canal = ctx.channel;
        const mensagensDeletadas = await canal.bulkDelete(quantidade, true);
    
        if (!silencioso) canal.send(`Foram apagadas ${mensagensDeletadas.size} mensagens por ${ctx.interaction.user}.`);
    
        await ctx.interaction.reply({ content: `Foram apagadas ${mensagensDeletadas.size} mensagens!`, flags: MessageFlags.Ephemeral});

    } catch (error: any) {
        console.error(`Erro ao executar o comando /clear: ${error.stack}`);
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o comando!`, flags: MessageFlags.Ephemeral });
    }
};