import sorteioSchema from '@/app/schemas/sorteioSchema';
import type { EventHandler } from 'commandkit';
import { MessageFlags } from 'discord.js';

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
