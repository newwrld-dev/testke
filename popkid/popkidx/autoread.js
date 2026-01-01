import config from '../../config.cjs';

const autoread = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // 1. Command Logic to Toggle ON/OFF
  if (cmd === "autoread") {
    const mode = args[0]?.toLowerCase();

    if (mode === "on") {
      global.autoReadEnabled = true;
      await m.React('☑️');
      return sock.sendMessage(m.from, { text: "☑️ *Autoread is now ENABLED*" }, { quoted: m });
    } 
    
    if (mode === "off") {
      global.autoReadEnabled = false;
      await m.React('❌');
      return sock.sendMessage(m.from, { text: "📖 *Autoread is now DISABLED*" }, { quoted: m });
    }

    return sock.sendMessage(m.from, { text: `Usage: ${prefix}autoread on/off` }, { quoted: m });
  }

  // 2. Background Logic (Sends the Blue Tick)
  if (global.autoReadEnabled === true && m.key) {
    // This sends the read receipt to the sender
    await sock.readMessages([m.key]);
  }
};

export default autoread;
