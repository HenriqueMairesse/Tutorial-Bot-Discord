import sorteioSchema from '@/app/schemas/sorteioSchema';
import type { EventHandler } from 'commandkit';
import { LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import config from 'config.json';
import giveawayRoll from '@/app/utils/giveawayRoll';

const handler: EventHandler<'interactionCreate'> = async (interaction, client) => {

    try {

        if (!interaction.isButton() || !interaction.customId.startsWith('sorteio')) return;

        if (interaction.customId === "sorteioEntrar") {

            const sorteio = await sorteioSchema.findOne({ messageID: interaction.message.id});
            if (!sorteio) {
                interaction.reply({ content: "Sorteio não achado", flags: MessageFlags.Ephemeral});
                return;
            }
            if (sorteio.participantes.includes(interaction.user.id)) {
                interaction.reply({ content: "Você já está participando", flags: MessageFlags.Ephemeral});
                return;
            }
            sorteio.participantes.push(interaction.user.id);
            interaction.reply({ content: "Agora você está participando!", flags: MessageFlags.Ephemeral});
            await sorteio.save();

        } else if (interaction.customId === "sorteioSortear") {

            if (!interaction.memberPermissions || !interaction.memberPermissions.has('Administrator')) {
                interaction.reply({ content: "Você não pode fazer isso!", flags: MessageFlags.Ephemeral});
                return;
            }

            const sorteio = await sorteioSchema.findOne({ messageID: interaction.message.id});
            if (!sorteio) {
                interaction.reply({ content: "Sorteio não achado", flags: MessageFlags.Ephemeral});
                return;
            }

            if (!interaction.guild) throw new Error("Guilda não foi encontrada");

            const canal = await interaction.guild.channels.fetch(config.canalSorteio);
            if (!canal || !canal.isSendable()) {
                interaction.reply({ content: "Canal está inválido para a realização do sorteio", flags: MessageFlags.Ephemeral});
                return;
            }

            const modalSorteio = new LabelBuilder()
                .setLabel("Ganhadores:")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId('sorteioModalText')
                        .setMaxLength(3)
                        .setValue(`${sorteio.ganhadores}`)
                        .setPlaceholder("Digite aqui a quantidade de ganhadores")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )

            const modal = new ModalBuilder()
                .setCustomId(`sorteio-${interaction.id}`)
                .setTitle("Sortear Novamente")

            modal.addLabelComponents(modalSorteio);

            interaction.showModal(modal);

            const filter = (i: ModalSubmitInteraction) => i.customId === `sorteio-${interaction.id}`;
            const sorteioModalInteraction = await interaction.awaitModalSubmit({filter, time: 1000 * 60 * 10}).catch((error) => console.log(error));
            if (!sorteioModalInteraction) return;

            try {

                const numeroSorteio = parseInt(sorteioModalInteraction.fields.getTextInputValue('sorteioModalText'));
                if (!numeroSorteio || isNaN(numeroSorteio)) {
                    await sorteioModalInteraction.reply({content: 'Ocorreu um erro ao sortear novamente', flags: MessageFlags.Ephemeral});
                    return;
                }
                await canal.send(`Parabéns ${numeroSorteio > 1 ? "aos novos ganhadores" : "ao novo ganhador" } do ${sorteio.premio}!\n${numeroSorteio > 1 ? "Ganhadores" : "Ganhador" }: ${giveawayRoll(sorteio.participantes, numeroSorteio)}`);        
        
                sorteioModalInteraction.reply({content: "Sorteio Refeito", flags: MessageFlags.Ephemeral});
                
            } catch (error) {
                sorteioModalInteraction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
                console.error(error);
                return;
            }

        } else if (interaction.customId === "sorteioDeletar") {

            if (!interaction.memberPermissions || !interaction.memberPermissions.has('Administrator')) {
                interaction.reply({ content: "Você não pode fazer isso!", flags: MessageFlags.Ephemeral});
                return;
            }

            const sorteio = await sorteioSchema.findOne({ messageID: interaction.message.id});
            if (!sorteio) {
                interaction.reply({ content: "Sorteio não achado", flags: MessageFlags.Ephemeral});
                return;
            }

            interaction.message.delete();

            await sorteio.deleteOne();
            interaction.reply({ content: "Sorteio Deletado!", flags: MessageFlags.Ephemeral});
            
        }

    } catch (error: any) {
        if (interaction.isButton()) {
            interaction.reply({content: "Ocorreu um erro!", flags: MessageFlags.Ephemeral });
        }
        console.error("Erro no evento interactionCreate em handlerSorteio.ts: \n" + error.message);
    }
};

export default handler;
