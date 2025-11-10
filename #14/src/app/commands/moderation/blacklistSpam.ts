import blacklistSpamSchema from '@/app/schemas/blacklistSpamSchema';
import type { ChatInputCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';

export const command: CommandData = {
  name: 'blacklistspam',
  description: "Configura a moderação para spam!",
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  contexts: [InteractionContextType.Guild],
  options: [
    {
        name: 'tipo',
        description: 'Qual tipo deseja ativar/desativar',
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          { name: "Flood", value: "flood" },
          { name: "CapsLock", value: "caps" },
          { name: "Links", value: "link" },
          { name: "Menções", value: "ment" },
        ]
    },
  ]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {

      const tipo = ctx.options.getString("tipo");

      if (!tipo || !ctx.guild) throw new Error("Ação inválida");

      let blacklistSpam = await blacklistSpamSchema.findOne({ guildID: ctx.guild.id });
      if (!blacklistSpam) {
        blacklistSpam = await blacklistSpamSchema.create({ guildID: ctx.guild.id });
        if (!blacklistSpam) throw new Error("Schema não encontrado após criar");
      }

      switch (tipo) {
        case "flood": {

            blacklistSpam.flood = !blacklistSpam.flood;
            await blacklistSpam.save();

            ctx.interaction.reply({ content: `O módulo flood foi ${blacklistSpam.flood ? "**ativado**" : "**desativado**"}!`, flags: MessageFlags.Ephemeral })

            break;
        }

        case "caps": {

            blacklistSpam.caps = !blacklistSpam.caps;
            await blacklistSpam.save();

            ctx.interaction.reply({ content: `O módulo capslock foi ${blacklistSpam.caps ? "**ativado**" : "**desativado**"}!`, flags: MessageFlags.Ephemeral })

            break;
        }

        case "link": {

            blacklistSpam.links = !blacklistSpam.links;
            await blacklistSpam.save();

            ctx.interaction.reply({ content: `O módulo links foi ${blacklistSpam.links ? "**ativado**" : "**desativado**"}!`, flags: MessageFlags.Ephemeral })

            break;
        } 
      
        case "ment": {

            blacklistSpam.mentions = !blacklistSpam.mentions;
            await blacklistSpam.save();

            ctx.interaction.reply({ content: `O módulo links foi ${blacklistSpam.mentions ? "**ativado**" : "**desativado**"}!`, flags: MessageFlags.Ephemeral })

            break;
        } 

        default: {
          ctx.interaction.reply({ content: "Tipo inválido", flags: MessageFlags.Ephemeral })
          break;
        }
      }


    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }
};