import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

const startTime = Date.now();

const formatRuntime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmdName = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmdName === "menu2" || cmdName === "allmenu2") {
    await m.React('🪆');

    const runtime = formatRuntime(Date.now() - startTime);
    const mode = m.isGroup ? "Public" : "Private";
    const ownerName = config.OWNER_NAME || "ᴘᴏᴘᴋɪᴅ ᴍᴅ";

    // --- PATH CORRECTED FOR YOUR STRUCTURE ---
    const categories = {};
    // This points specifically to popkid/popkidx/
    const commandsPath = path.join(process.cwd(), 'popkid', 'popkidx'); 

    try {
      const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of files) {
        // Dynamically load the command data
        const plugin = await import(`file://${path.join(commandsPath, file)}`);
        
        // Extracting data from your command files
        // (Assuming you use 'export default' or 'module.exports')
        const cmdData = plugin.default || plugin;

        if (cmdData.category && cmdData.pattern) {
          const cat = cmdData.category.toUpperCase();
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmdData.pattern);
        } else {
          // If no category is found, put it in 'MISC'
          if (!categories['MISC']) categories['MISC'] = [];
          categories['MISC'].push(file.replace('.js', ''));
        }
      }
    } catch (err) {
      console.error("Path Error:", err);
    }

    let menuText = `
╭───────────────⭓
│ ʙᴏᴛ : *ᴘᴏᴘᴋɪᴅ ᴍᴅ*
│ ʀᴜɴᴛɪᴍᴇ : ${runtime}
│ ᴍᴏᴅᴇ : ${mode}
│ ᴘʀᴇғɪx : ${prefix}
│ ᴏᴡɴᴇʀ : ${ownerName}
│ ᴠᴇʀ : *𝟸.𝟶.𝟶*
╰───────────────⭓
───────────────────
ᴘᴏᴘᴋɪᴅ ᴍᴅ (ᴀᴜᴛᴏ-ʟᴏᴀᴅ)
───────────────────\n`;

    const sortedCats = Object.keys(categories).sort();
    for (const cat of sortedCats) {
      menuText += `⭓──────────────────⭓『 ${cat} 』\n`;
      categories[cat].sort().forEach(cmd => {
        menuText += `│ ⬡ ${cmd}\n`;
      });
      menuText += `╰──────────────────⭓\n`;
    }

    menuText += `\n🥰𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃🥰`;

    // Profile Picture Fetch
    let profilePictureUrl = 'https://files.catbox.moe/syekq2.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch (e) {}

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText.trim(),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "ᴘᴏᴘᴋɪᴅ ᴍᴅ",
          newsletterJid: "120363289379419860@newsletter",
        },
      }
    }, { quoted: m });
  }
};

export default menu;
