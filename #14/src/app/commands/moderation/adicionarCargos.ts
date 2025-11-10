import type { ChatInputCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, GuildMember, InteractionContextType, LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, Role, RoleSelectMenuBuilder } from 'discord.js';

export const command: CommandData = {
  name: 'adicionar-cargos',
  description: "Adiciona cargos para um membro",
  default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
  contexts: [InteractionContextType.Guild],
  options: [
    {
        name: 'membro',
        description: 'O membro que deseja adicionar os cargos',
        required: true,
        type: ApplicationCommandOptionType.Mentionable
    }
  ]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {
        
        if (!ctx.guild) throw new Error("Guilda não encontrada");
        
        const membro = ctx.options.getMember('membro');
        const autor = ctx.interaction.member;
        const bot = ctx.guild.members.me;

        if (!membro || !(membro instanceof GuildMember) || !autor || !bot || !(autor instanceof GuildMember)) throw new Error("Membro inválido");

        const modal = new ModalBuilder()
            .setCustomId(`adicionarCargos-${ctx.interaction.id}`)
            .setTitle("Escolha os Cargos")
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Use o seletor para escolher os cargos")
                    .setDescription("Você precisa escolher pelo menos um cargo")
                    .setRoleSelectMenuComponent(
                        new RoleSelectMenuBuilder()
                            .setRequired(true)
                            .setCustomId("cargos")
                            .setMaxValues(25)
                    )
            )

        ctx.interaction.showModal(modal);

        const filter = (i: ModalSubmitInteraction) => i.customId === `adicionarCargos-${ctx.interaction.id}`;
        const cargoModalInteraction = await ctx.interaction.awaitModalSubmit({filter, time: 1000 * 60 * 10}).catch((error) => console.log(error));
        if (!cargoModalInteraction) return;

        try {

            const cargos = cargoModalInteraction.fields.getSelectedRoles('cargos');
            if (!cargos) return cargoModalInteraction.reply({content: 'Ocorreu um erro ao adicionar os cargos', flags: MessageFlags.Ephemeral});

            const autorPosicaoCargo = autor.roles.highest.position;
            const botPosicaoCargo = bot.roles.highest.position;

            cargos.forEach(async (cargo) => {
                if (!cargo) return;
                if (!(cargo instanceof Role)) {
                    cargo = await ctx.guild?.roles.fetch(cargo.id) ?? null;
                    if (!cargo) return;
                }
                if (botPosicaoCargo > cargo.position && autorPosicaoCargo > cargo.position) {
                    membro.roles.add(cargo);
                }
            })
            
            cargoModalInteraction.reply({content: 'Cargos adicionados com sucesso!', flags: MessageFlags.Ephemeral})
            
        } catch (error) {
            cargoModalInteraction.reply({ content: `Ocorreu um erro ao processar a solicitação!`, flags: MessageFlags.Ephemeral });
            console.error("Erro no modal de adicionarCargos" + error);
            return;
        }

    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error("Erro em comando /adicionarCargos:" + error);
    }

};
