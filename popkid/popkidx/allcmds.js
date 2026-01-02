import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const allCmdsCommand = async (m, sock) => {
  const prefix = config.PREFIX;

  // Check if the message starts with the prefix
  if (!m.body?.startsWith(prefix)) return;

  const cmd = m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase();

  // Check if the command is 'allcmds'
  if (cmd !== 'allcmds') return;

  /** * OWNER RESTRICTION REMOVED 
   * Anyone can now trigger the logic below.
   */

  // Define the path to your plugins/commands folder
  const folderPath = path.resolve(process.cwd(), '../popkid/popkidx');

  // Check if the folder exists on the server
  if (!fs.existsSync(folderPath)) {
    await m.React('❌');
    return sock.sendMessage(
      m.from,
      { text: `❌ Folder not found at: ${folderPath}` },
      { quoted: m }
    );
  }

  try {
    // Read files in the directory
    const files = fs.readdirSync(folderPath);
    // Filter to only show .js files and remove the extension for a cleaner look
    const jsFiles = files
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''));

    if (jsFiles.length === 0) {
      await m.React('❌');
      return sock.sendMessage(
        m.from,
        { text: '❌ No command files found in the directory.' },
        { quoted: m }
      );
    }

    // Success: Send the list of commands
    await m.React('✅');
    const commandList = jsFiles.map((f, i) => `${i + 1}. ${f}`).join('\n');
    
    return sock.sendMessage(
      m.from,
      {
        text: `*ʜᴇʀᴇ ᴀʀᴇ ᴘᴏᴘᴋɪᴅ ᴍᴅ ᴘʟᴜɢɪɴs*\n\n${commandList}`,
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    await m.React('❌');
    return sock.sendMessage(
      m.from,
      { text: '❌ Failed to read the command folder.' },
      { quoted: m }
    );
  }
};

export default allCmdsCommand;
