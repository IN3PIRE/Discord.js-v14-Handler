const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and bot latency.'),
  async execute(interaction) {
    await interaction.deferReply();

    const startTime = Date.now();
    await interaction.editReply({ content: 'Pinging... 📡' });
    const endTime = Date.now();
    const latency = endTime - startTime;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Pong! 🏓')
      .setDescription(`⚡ Roundtrip latency: \`${latency}ms\` `)
      .setTimestamp()
      .setFooter({ text: 'Powered by IN3PIRE', iconURL: getBotAvatarURL(interaction.client) });

    const refreshButton = new ButtonBuilder()
      .setCustomId('refreshPing')
      .setLabel('🔄 Refresh')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(refreshButton);

    await interaction.editReply({ content: ' ', embeds: [embed], components: [row] });

    const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

    collector.on('collect', async i => {
      if (i.customId === 'refreshPing') {
        await i.deferUpdate();
        const newStartTime = Date.now();
        await i.editReply({ content: 'Pinging... 📡' });
        const newEndTime = Date.now();
        const newLatency = newEndTime - newStartTime;

        const newEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle('Pong! 🏓')
          .setDescription(`⚡ Roundtrip latency: \`${newLatency}ms\` `)
          .setTimestamp()
          .setFooter({ text: 'Powered by IN3PIRE', iconURL: getBotAvatarURL(interaction.client) });

        await i.editReply({ content: ' ', embeds: [newEmbed], components: [row] });
      }
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] });
    });
  },
};

function getBotAvatarURL(client) {
  return client.user.displayAvatarURL({ size: 1024, dynamic: true });
}
