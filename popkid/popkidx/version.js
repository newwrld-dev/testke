import config from '../../config.cjs';

const versionCommand = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'version') return;

  const message = `
🌟 *ᴘᴏᴘᴋɪᴅ ᴍᴅ - Version Info*
╭───────────────⭓
│ 🤖 *Bot Name:* ᴘᴏᴘᴋɪᴅ ᴍᴅ
│ 🛠️ *Version:* 2.0.0
│ 👑 *Developer:* ᴘᴏᴘᴋɪᴅ ᴍᴅ
╰───────────────⭓

🚀 Stay tuned for more updates!
  `.trim();

  await sock.sendMessage(m.from, {
    image: { url: 'https://files.catbox.moe/syekq2.jpg' },
    caption: message,
    contextInfo: {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: 'ᴘᴏᴘᴋɪᴅ ᴍᴅ',
        newsletterJid: '120363289379419860@newsletter',
      },
    },
  }, { quoted: m });
};

export default versionCommand;
