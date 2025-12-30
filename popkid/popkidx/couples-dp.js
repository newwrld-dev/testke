import config from "../../config.cjs";
import { fetchCoupleDP } from "../../popkid/tech.js";

const couplePP = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body.startsWith(prefix) ? m.body.slice(prefix.length) : "";
  const command = body.trim().split(" ")[0].toLowerCase();
  const validCmds = ["ppcauple", "couple", "cpp"];
  if (!validCmds.includes(command)) return;

  try {
    if (typeof m.React === "function") await m.React("❤️");

    const { male, female } = await fetchCoupleDP();
    const inconnuThumb = `https://files.catbox.moe/syekq2.jpg`;

    const contextTemplate = {
      isForwarded: true,
      forwardingScore: 2025,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363289379419860@newsletter',
        newsletterName: "ᴘᴏᴘᴋɪᴅ ᴍᴅ",
        serverMessageId: 99
      },
      externalAdReply: {
        title: "COUPLE DP GENERATOR",
        body: "ᴘᴏᴘᴋɪᴅ ᴍᴅ",
        mediaType: 1,
        thumbnailUrl: inconnuThumb,
        sourceUrl: "https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r",
        renderLargerThumbnail: true
      }
    };

    await gss.sendMessage(m.from, {
      image: { url: male },
      caption: `╭────[ 🧑 *FOR MALE* ]\n│  _ᴘᴏᴘᴋɪᴅ ᴍᴅ_\n╰──────◆`,
      contextInfo: contextTemplate,
    }, { quoted: m });

    await gss.sendMessage(m.from, {
      image: { url: female },
      caption: `╭────[ 👩 *FOR FEMALE* ]\n│  _ᴘᴏᴘᴋɪᴅ ᴍᴅ_\n╰──────◆`,
      contextInfo: contextTemplate,
    }, { quoted: m });

    if (typeof m.React === "function") await m.React("✅");

  } catch (err) {
    console.error("Couple PP command error:", err);
    if (typeof m.React === "function") await m.React("❌");
    await m.reply("❌ *Failed to fetch couple DP.*\nPlease try again later.");
  }
};

export default couplePP;
