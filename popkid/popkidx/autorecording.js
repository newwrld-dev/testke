import config from '../../config.cjs';

const autorecording = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // 1. Command Logic to Toggle ON/OFF
  if (cmd === "autorecording") {
    const mode = args[0]?.toLowerCase();

    if (mode === "on") {
      global.autorecordingEnabled = true; // Sets a global flag
      await m.React('🎙️');
      return sock.sendMessage(m.from, { text: "🎙️ *Autorecording is now ENABLED*" }, { quoted: m });
    } 
    
    if (mode === "off") {
      global.autorecordingEnabled = false; // Unsets the flag
      await m.React('❌');
      return sock.sendMessage(m.from, { text: "🔇 *Autorecording is now DISABLED*" }, { quoted: m });
    }

    return sock.sendMessage(m.from, { text: `Usage: ${prefix}autorecording on/off` }, { quoted: m });
  }

  // 2. Background Logic (Sends the 'recording' status)
  if (global.autorecordingEnabled === true && m.from) {
    await sock.sendPresenceUpdate('recording', m.from);
  }
};

export default autorecording;
