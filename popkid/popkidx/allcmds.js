import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const allCmdsCommand = async (m, sock) => {
  const prefix = config.PREFIX;

  if (!m.body?.startsWith(prefix)) return;

  const cmd = m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase();

  if (cmd !== 'allcmds') return;

  // ✅ Deployer / Owner JID
  const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';

  // ❌ Block non-owner
  if (m.sender !== ownerJid) {
    await m.React('❌');
    return sock.sendMessage(
      m.from,
      { text: '❌ Only the bot owner can use this command.' },
      { quoted: m }
    );
  }

  const folderPath = path.resolve(process.cwd(), '../popkid/popkidx');

  // Check folder exists
  if (!fs.existsSync(folderPath)) {
    await m.React('❌');
    return sock.sendMessage(
      m.from,
      { text: `❌ Folder not found.` },
      { quoted: m }
    );
  }

  try {
    const files = fs.readdirSync(folderPath);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    if (!jsFiles.length) {
      await m.React('❌');
      return sock.sendMessage(
        m.from,
        { text: '❌ No command files found.' },
        { quoted: m }
      );
    }

    await m.React('✅');
    return sock.sendMessage(
      m.from,
      {
        text: `*ʜᴇʀᴇ ᴀʀᴇ ᴘᴏᴘᴋɪᴅ ᴍᴅ ᴘʟᴜɢɪɴ ғᴏʟᴅᴇʀs*\n\n${jsFiles.join('\n')}`,
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    await m.React('❌');
    return sock.sendMessage(
      m.from,
      { text: '❌ Failed to read command folder.' },
      { quoted: m }
    );
  }
};

export default allCmdsCommand;
