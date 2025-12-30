import config from '../../config.cjs';
import fetch from 'node-fetch';

const repo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "repo") {
    await m.React('🚀');
    const repoUrl = 'https://github.com/popkidmd/POPKID-MD';
    const imageUrl = 'https://files.catbox.moe/syekq2.jpg';

    try {
      const apiUrl = `https://api.github.com/repos/popkimd/POPKID-MD`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Get user name or fallback
      const contact = await sock.onWhatsApp(m.sender.split('@')[0]);
      const userName = (contact?.[0]?.notify || m.pushName || 'User').trim();

      if (data && data.forks_count !== undefined && data.stargazers_count !== undefined) {
        const menuText = `
🌟 *HELLO  (${userName})* 👋
─────────────────────────────

💎 *ᴘᴏᴘᴋɪᴅ ᴍᴅ* 💎

🔗 *GitHub Link:* 
${repoUrl}

📊 *Live Repository Stats:*
⭐ Stars: *${data.stargazers_count}*
🍴 Forks: *${data.forks_count}*

🚀 *Why Choose ᴘᴏᴘᴋɪᴅ ᴍᴅ?*
✅ Multi-Session Support
✅ Auto QR Mode
✅ Stylish UI & Animated Commands
✅ Easy Deploy & Maintain

🎥 *Watch Tutorial & Setup:*
https://www.youtube.com/@popkid-254

─────────────────
*❤️ ᴘᴏᴘᴋɪᴅ ᴍᴅ*
──────────────────
        `.trim();

        await sock.sendMessage(m.from, {
          image: { url: imageUrl },
          caption: menuText,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "ᴘᴏᴘᴋɪᴅ ᴍᴅ",
              newsletterJid: "120363289379419860@newsletter",
            },
          },
        }, { quoted: m });

      } else {
        await sock.sendMessage(m.from, {
          text: '⚠️ GitHub repository data unavailable. Please try again later.',
          quoted: m
        });
      }

    } catch (error) {
      console.error("Repo fetch error:", error);
      await sock.sendMessage(m.from, {
        text: '🚨 Failed to load repository information.',
        quoted: m
      });
    } finally {
      await m.React('✅');
    }
  }
};

export default repo;
