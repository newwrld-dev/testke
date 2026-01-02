import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

// Cache the commands so we don't scan 136 files every single time
let commandCache = null;
const startTime = Date.now();

const formatRuntime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m ${totalSeconds % 60}s`;
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmdName = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmdName === "menu2") {
    const start = Date.now();
    await m.React('⏳'); // Show the bot is thinking

    const commandsPath = path.join(process.cwd(), 'popkid', 'popkidx');

    // Only scan if the cache is empty
    if (!commandCache) {
        commandCache = { categories: {}, total: 0 };
        try {
            const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            commandCache.total = files.length;

            for (const file of files) {
                // Read file as text first (FASTER than importing)
                const content = fs.readFileSync(path.join(commandsPath, file), 'utf8');
                
                // Extract category and pattern using Regex (High Speed)
                const catMatch = content.match(/category:\s*['"`](.*?)['"`]/);
                const patMatch = content.match(/pattern:\s*['"`](.*?)['"`]/);

                const cat = catMatch ? catMatch[1].toUpperCase() : 'OTHER';
                const pat = patMatch ? patMatch[1] : file.replace('.js', '');

                if (!commandCache.categories[cat]) commandCache.categories[cat] = [];
                commandCache.categories[cat].push(pat);
            }
        } catch (e) {
            console.error(e);
        }
    }

    let menuText = `╭───────────────⭓
│ ʙᴏᴛ : *ᴘᴏᴘᴋɪᴅ ᴍᴅ*
│ ʀᴜɴᴛɪᴍᴇ : ${formatRuntime(Date.now() - startTime)}
│ ᴘʟᴜɢɪɴs : ${commandCache.total}
│ sᴘᴇᴇᴅ : ${Date.now() - start}ms
╰───────────────⭓\n`;

    Object.keys(commandCache.categories).sort().forEach(cat => {
        menuText += `\n⭓─『 ${cat} 』\n`;
        commandCache.categories[cat].sort().forEach(cmd => {
            menuText += `│ ⬡ ${prefix}${cmd}\n`;
        });
    });

    await sock.sendMessage(m.from, {
        image: { url: 'https://files.catbox.moe/syekq2.jpg' },
        caption: menuText,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: "ᴘᴏᴘᴋɪᴅ ᴍᴅ",
                newsletterJid: "120363289379419860@newsletter"
            }
        }
    }, { quoted: m });
    
    await m.React('✅');
  }
};

export default menu;
                                                        
