import sugestaoSchema from '@/app/schemas/sugestaoSchema';
import type { EventHandler } from 'commandkit';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';

const handler: EventHandler<'interactionCreate'> = async (interaction, client) => {

    try {

        if (!interaction.isButton() || !interaction.customId.startsWith('sugestao')) return;

        const [ handler, id, tipo ] = interaction.customId.split("-");
        if (!handler || !id || !tipo) throw new Error();

        const sugestao = await sugestaoSchema.findById(id);
        if (!sugestao) throw new Error();

        const votouSim = sugestao.votouSim;
        const votouNao = sugestao.votouNao;
        const total = votouNao.length + votouSim.length + 1;

        if (votouSim.includes(interaction.user.id) || votouNao.includes(interaction.user.id)) {
            interaction.reply({content: "Você já votou nessa sugestão", flags: MessageFlags.Ephemeral });
            return;
        }

        if (tipo == "votarSim") {
            votouSim.push(interaction.user.id);
            await sugestao.updateOne({
                votouSim: votouSim
            })
        } else if (tipo == "votarNao") {
            votouNao.push(interaction.user.id);
            await sugestao.updateOne({
                votouNao: votouNao
            })
        } else {
            throw new Error();
        }

        const mensagem = await interaction.message.fetch();

        const simPorcentagem = (votouSim.length / total * 100).toFixed(2);
        const naoPorcentagem = (votouNao.length / total * 100).toFixed(2);

        const novoBotao = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`sugestao-${id}-votarSim`)
                .setEmoji('✅')
                .setLabel(`${votouSim.length} - ${simPorcentagem}%`)
                .setStyle(ButtonStyle.Success),
                
            new ButtonBuilder()
                .setCustomId(`sugestao-${id}-votarNao`)
                .setEmoji('❎')
                .setLabel(`${votouNao.length} - ${naoPorcentagem}%`)
                .setStyle(ButtonStyle.Danger),
        )


        await mensagem.edit({components: [novoBotao]});

        interaction.reply({content: "Você votou na sugestão!", flags: MessageFlags.Ephemeral })

    } catch (error: any) {
        if (interaction.isButton()) {
            interaction.reply({content: "Ocorreu um erro!", flags: MessageFlags.Ephemeral });
        }
        console.error("Erro no evento interactionCreate em handlerSugestao.ts: \n" + error.message);
    }
};

export default handler;
