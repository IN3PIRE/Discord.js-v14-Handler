const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and bot latency.'),
  async execute(interaction) {
    const startTime = Date.now();
    const message = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const endTime = Date.now();
    const latency = endTime - startTime;

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Pong! 🏓')
      .setDescription(`Roundtrip latency: ${latency}ms`)
      .setTimestamp()
      .setFooter({ text: 'Powered by LavaDev Network', iconURL: getBotAvatarURL(interaction.client) });

    const refreshButton = new ButtonBuilder()
      .setCustomId('refreshPing')
      .setLabel('Refresh')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(refreshButton);

    await interaction.editReply({ content: '', embeds: [embed], components: [row] });

    const collector = interaction.channel.createMessageComponentCollector({ time: 15000 }); 

    collector.on('collect', async i => {
      if (i.customId === 'refreshPing') {
        await i.deferUpdate(); 
        const newStartTime = Date.now();
        const newMessage = await i.editReply({ content: 'Pinging...', fetchReply: true });
        const newEndTime = Date.now();
        const newLatency = newEndTime - newStartTime;

        const newEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('Pong! 🏓')
          .setDescription(`Roundtrip latency: ${newLatency}ms`)
          .setTimestamp()
          .setFooter({ text: 'Powered by LavaDev Network', iconURL: getBotAvatarURL(interaction.client) });

        await i.editReply({ content: '', embeds: [newEmbed], components: [row] }); 
      }
    });
  },
};

function getBotAvatarURL(client) {
  return client.user.displayAvatarURL({ size: 1024, dynamic: true });
}
