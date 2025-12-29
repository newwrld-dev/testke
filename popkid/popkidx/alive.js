const alive = async (m, sock) => {
  try {
    const prefix = '.'; // adapte si tu changes de préfixe
    const body = m.body || '';
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : body.trim().toLowerCase();

    // Exécuter seulement si le message est exactement "alive" ou "inconnu"
    if (cmd !== 'alive' && cmd !== 'popkid') return;

    const aliveText = `
━━━━━━━━━━━━━━━
*POPKID🫴❤️* 
━━━━━━━━━━━━━━━

✅ Bot: *ONLINE*
📅 Date: ${new Date().toLocaleDateString('en-GB')}
🕒 Time: ${new Date().toLocaleTimeString('en-GB')}
👤 User: @${m.sender.split('@')[0]}
💻 Version: 2.0.0

━━━━━━━━━━━━━━━
    `;

    const profilePictureUrl = "https://files.catbox.moe/syekq2.jpg";

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: aliveText.trim(),
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "popkid md",
          newsletterJid: "120363289379419860@newsletter",
        },
        mentionedJid: [m.sender],
      },
    }, { quoted: m });

  } catch (err) {
    console.error("[ALIVE ERROR]:", err.message);
  }
};

export default alive;
