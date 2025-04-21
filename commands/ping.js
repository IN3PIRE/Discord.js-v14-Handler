const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'ping',
    description: 'Replies with Pong! and bot latency.',
    aliases: ['pong']
  },
  async execute(message, args, client) {
    const startTime = Date.now();
    const messageResponse = await message.reply({ content: 'Pinging... 📡', fetchReply: true });
    const endTime = Date.now();
    const latency = endTime - startTime;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Pong! 🏓')
      .setDescription(`⚡ Roundtrip latency: \`${latency}ms\` `)
      .setTimestamp()
      .setFooter({ text: 'Powered by IN3PIRE', iconURL: getBotAvatarURL(client) });

    const refreshButton = new ButtonBuilder()
      .setCustomId('refreshPing')
      .setLabel('🔄 Refresh')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(refreshButton);

    await messageResponse.edit({ content: '', embeds: [embed], components: [row] });

    const collector = messageResponse.channel.createMessageComponentCollector({
      time: 15000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'refreshPing') {
        await i.deferUpdate();
        const newStartTime = Date.now();
        await messageResponse.edit({ content: 'Pinging... 📡' });
        const newEndTime = Date.now();
        const newLatency = newEndTime - newStartTime;

        const newEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle('Pong! 🏓')
          .setDescription(`⚡ Roundtrip latency: \`${newLatency}ms\` `)
          .setTimestamp()
          .setFooter({ text: 'Powered by IN3PIRE', iconURL: getBotAvatarURL(client) });

        await messageResponse.edit({ content: '', embeds: [newEmbed], components: [row] });
      }
    });

    collector.on('end', () => {
      messageResponse.edit({ components: [] });
    });
  },
};

function getBotAvatarURL(client) {
  return client.user.displayAvatarURL({ size: 1024, dynamic: true });
}
