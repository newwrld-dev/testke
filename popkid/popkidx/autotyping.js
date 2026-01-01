import config from '../../config.cjs';

const autotyping = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // 1. Command Logic to Toggle ON/OFF
  if (cmd === "autotyping") {
    const mode = args[0]?.toLowerCase();

    if (mode === "on") {
      global.autotypingEnabled = true; // Sets a global flag
      await m.React('✅');
      return sock.sendMessage(m.from, { text: "✨ *Autotyping is now ENABLED*" }, { quoted: m });
    } 
    
    if (mode === "off") {
      global.autotypingEnabled = false; // Unsets the flag
      await m.React('❌');
      return sock.sendMessage(m.from, { text: "😴 *Autotyping is now DISABLED*" }, { quoted: m });
    }

    return sock.sendMessage(m.from, { text: `Usage: ${prefix}autotyping on/off` }, { quoted: m });
  }

  // 2. Background Logic (Runs on every message if enabled)
  // This part triggers whenever ANY message is processed by this file
  if (global.autotypingEnabled === true && m.from) {
    await sock.sendPresenceUpdate('composing', m.from);
  }
};

export default autotyping;
