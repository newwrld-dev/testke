const thanksCommand = async (m, Matrix) => {
    const prefix = "."; // Change this if your bot uses a different prefix
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';

    const validCommands = ['thanks', 'thanksto', 'dev'];
    if (!validCommands.includes(cmd)) return;

    await m.React('👤');

    const message = `
╭─❏ *DEVELOPER:*
│👨‍💻 DEV : *©ᴘᴏᴘᴋɪᴅ ᴍᴅ*
│👨‍💻 NUM : +254732297194
│───────────────────
│🛠️ BOT: *ᴘᴏᴘᴋɪᴅ ᴍᴅ*
│───────────────────
│🙋‍♂️ HELLO @${m.sender.split("@")[0]}
╰──────────────────❏
`;

    try {
        await Matrix.sendMessage(m.from, {
            image: { url: 'https://files.catbox.moe/syekq2.jpg' },
            caption: message,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363289379419860@newsletter', // optional
                    newsletterName: 'ᴘᴏᴘᴋɪᴅ ᴍᴅ',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

        await m.React("✅");
    } catch (err) {
        console.error("Thanks Command Error:", err);
        await Matrix.sendMessage(m.from, { text: `Error: ${err.message}` }, { quoted: m });
        await m.React("❌");
    }
};

export default thanksCommand;
