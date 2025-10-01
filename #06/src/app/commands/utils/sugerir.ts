import type { ChatInputCommand, CommandData } from 'commandkit';
import config from 'config.json';
import { ActionRowBuilder, EmbedBuilder, GuildMember, InteractionContextType, MessageFlags, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';

export const command: CommandData = {
  name: 'sugerir',
  description: "Use para enviar uma sugestão.",
  contexts: [InteractionContextType.Guild]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {
    
        if (!ctx.guild || !(ctx.interaction.member instanceof GuildMember) ) return;

        const canal = await ctx.guild.channels.fetch(config.canalSugestao);
        if (!canal || !canal.isSendable()) throw new Error; 

        const modalTextInput = new TextInputBuilder()
            .setCustomId('suggestionModalText')
            .setMaxLength(2048)
            .setPlaceholder("Digite aqui sua sugestão")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setLabel("Sugestão:")

        const modal = new ModalBuilder()
            .setCustomId(`suggestion-${ctx.interaction.id}`)
            .setTitle("Faça sua Sugestão")

        const modalActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(modalTextInput);
        modal.addComponents(modalActionRow);

        ctx.interaction.showModal(modal);

        const filter = (i: ModalSubmitInteraction) => i.customId === `suggestion-${ctx.interaction.id}`;
        const sugestaoModalInteraction = await ctx.interaction.awaitModalSubmit({filter, time: 1000 * 60 * 10}).catch((error) => console.log(error));
        if (!sugestaoModalInteraction) return;
        sugestaoModalInteraction.deferReply({flags: MessageFlags.Ephemeral});

        const mensagemSugestao = sugestaoModalInteraction.fields.getTextInputValue('suggestionModalText');
        if (!mensagemSugestao) return sugestaoModalInteraction.editReply('Ocorreu um erro ao enviar a sugestão');

        const embedSugestao = new EmbedBuilder()
            .setTitle(`Nova sugestão`)
            .setDescription(mensagemSugestao)
            .setAuthor({ name: ctx.interaction.member.displayName, iconURL: ctx.interaction.member.avatarURL() ?? undefined })
            .setFooter({ text: "Use /sugerir para enviar sua sugestão!" })
            .setTimestamp(Date.now())
            .setColor("Gold");

        const mensagem = await canal.send({ embeds: [embedSugestao]});
        sugestaoModalInteraction.editReply('Sugestão enviada com sucesso!')

        await mensagem.react('✅');
        await mensagem.react('❌');
    
    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }
};
