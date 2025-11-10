import blacklistPalavrasSchema from '@/app/schemas/blacklistPalavrasSchema';
import type { ChatInputCommand, MessageCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType, Embed, EmbedBuilder, GuildMember, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';

export const command: CommandData = {
  name: 'blacklistpalavras',
  description: "Proibe uma palavra, remove uma palavra ou listar as palavras proibidas!",
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  contexts: [InteractionContextType.Guild],
  options: [
    {
        name: 'ação',
        description: 'A ação que deseja realizar',
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          { name: "Adicionar", value: "add" },
          { name: "Remover", value: "rem" },
          { name: "Listar", value: "lis" },
        ]
    },
    {
        name: 'palavra',
        description: 'A palavra que deseja adicionar ou remover',
        required: false,
        type: ApplicationCommandOptionType.String
    }, 
  ]
};

export const chatInput: ChatInputCommand = async (ctx) => {

    try {

      const acao = ctx.options.getString("ação");
      const palavra = ctx.options.getString("palavra");

      if (!acao || !ctx.guild) throw new Error("Ação inválida");

      let blacklistPalavras = await blacklistPalavrasSchema.findOne({ guildID: ctx.guild.id });
      if (!blacklistPalavras) {
        blacklistPalavras = await blacklistPalavrasSchema.create({ guildID: ctx.guild.id });
        if (!blacklistPalavras) throw new Error("Schema não encontrado após criar");
      }

      switch (acao) {
        case "add": {

          if (!palavra) return ctx.interaction.reply({content: "Escolha uma palavra", flags: MessageFlags.Ephemeral});

          if (blacklistPalavras.palavras.includes(palavra)) {
            return ctx.interaction.reply({content: "Essa palavra já está na lista", flags: MessageFlags.Ephemeral});
          }
          blacklistPalavras.palavras.push(palavra);
          await blacklistPalavras.save();
          return ctx.interaction.reply({content: "Palavra adicionada!", flags: MessageFlags.Ephemeral});
        }

        case "rem": {

          if (!palavra) return ctx.interaction.reply({content: "Escolha uma palavra", flags: MessageFlags.Ephemeral});

          if (!blacklistPalavras.palavras.includes(palavra)) {
            return ctx.interaction.reply({content: "Essa palavra não está na lista", flags: MessageFlags.Ephemeral});
          }
          blacklistPalavras.palavras = blacklistPalavras.palavras.filter(p => p != palavra);
          await blacklistPalavras.save();
          return ctx.interaction.reply({content: "Palavra removida!", flags: MessageFlags.Ephemeral});
        }

        case "lis": {

          const embed = new EmbedBuilder() 
            .setTitle("Lista de Palavras Proibidas")
            .setDescription(blacklistPalavras.palavras.length > 0 ? blacklistPalavras.palavras.map(p => `- ${p}`).join("\n"): null)

          return ctx.interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        } 
      
        default: {
          ctx.interaction.reply({ content: "Ação inválida", flags: MessageFlags.Ephemeral })
          break;
        }
      }


    } catch (error) {
        ctx.interaction.reply({ content: `Ocorreu um erro ao executar o seu comando!`, flags: MessageFlags.Ephemeral });
        console.error(error);
    }
};