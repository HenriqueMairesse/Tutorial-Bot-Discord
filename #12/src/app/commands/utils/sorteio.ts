import sorteioSchema from '@/app/schemas/sorteioSchema';
import type { ChatInputCommand, CommandData } from 'commandkit';
import config from 'config.json';
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import ms, { StringValue } from 'ms';

export const command: CommandData = {
  name: 'sorteio',
  description: "Faça um sorteio",
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  contexts: [InteractionContextType.Guild],
  options: [
    {
        name: 'ganhadores',
        description: 'A quantidade de ganhadores',
        required: true,
        type: ApplicationCommandOptionType.Number,
        min_value: 1,
    },
    {
        name: 'duração',
        description: 'O tempo de duração do sorteio',
        required: true,
        type: ApplicationCommandOptionType.String
    },
    {
        name: 'prêmio',
        description: 'O prêmio',
        required: true,
        type: ApplicationCommandOptionType.String
    },
    {
        name: 'descrição',
        description: 'A descrição do sorteio!',
        required: false,
        type: ApplicationCommandOptionType.String
    },
  ]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {
        
        if (!ctx.guild) throw new Error("Guilda não encontrada");

        const premio = ctx.interaction.options.getString('prêmio');
        const ganhadores = ctx.interaction.options.getNumber('ganhadores');
        const duracao = ctx.interaction.options.getString('duração') as StringValue;
        const descricao = ctx.interaction.options.getString('descrição') ?? '';

        if (!premio || !ganhadores) throw new Error("Sem premio ou Ganhadores");
        
        const canal  = await ctx.guild.channels.fetch(config.canalSorteio);
        if (!canal || !canal.isSendable()) throw new Error("Canal de sorteio inválido");

        const duracaoMs = ms(duracao);
        
        if (isNaN(duracaoMs)) {
            return ctx.interaction.reply({ content: "Por favor forneça um tempo válido.", flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(premio)
            .setDescription(descricao)
            .setFooter({ text: "Clique abaixo para participar do sorteio"})
            .setTimestamp(Date.now())
            .addFields([
                { name: "Quantidade de Ganhadores:", value: `${ganhadores}`, inline: true},
                { name: "Data de término:", value: `<t:${((Date.now() + duracaoMs) / 1000).toFixed(0)}:f>`, inline: true},
            ])
        
        const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("sorteioEntrar")
                .setEmoji('📥')
                .setStyle(ButtonStyle.Success)
                .setLabel("Entrar"),

            new ButtonBuilder()
                .setCustomId("sorteioSortear")
                .setEmoji('🔁')
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Sortear Novamente"),
            
            new ButtonBuilder()
                .setCustomId("sorteioDeletar")
                .setEmoji('🗑️')
                .setLabel("Deletar")
                .setStyle(ButtonStyle.Danger)
        )

        const mensagen = await canal.send({ content: "@everyone", embeds: [embed], components: [button]});
        const sorteio = await sorteioSchema.create({
            guildID: ctx.guild.id,
            dataTermino: Date.now() + duracaoMs,
            messageID: mensagen.id,
            premio: premio,
            ganhadores: ganhadores
        })
        await sorteio.save();

        ctx.interaction.reply({content: "Sorteio enviado!", flags: MessageFlags.Ephemeral});
        
    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error("Erro em comando /sorteio:" + error);
    }
};
