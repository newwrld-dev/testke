import config from '../../config.cjs';

const alwaysonline = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "alwaysonline") {
    const mode = args[0]?.toLowerCase();

    if (mode === "on") {
      global.alwaysOnlineEnabled = true;
      await m.React('🌐');
      // Tells WhatsApp you are active right now
      await sock.sendPresenceUpdate('available'); 
      return sock.sendMessage(m.from, { text: "🌐 *Always Online is now ENABLED*" }, { quoted: m });
    } 
    
    if (mode === "off") {
      global.alwaysOnlineEnabled = false;
      await m.React('😴');
      // Tells WhatsApp you are no longer active
      await sock.sendPresenceUpdate('unavailable'); 
      return sock.sendMessage(m.from, { text: "😴 *Always Online is now DISABLED*" }, { quoted: m });
    }

    return sock.sendMessage(m.from, { text: `Usage: ${prefix}alwaysonline on/off` }, { quoted: m });
  }

  // Background Logic: Keep the connection "Warm"
  if (global.alwaysOnlineEnabled === true) {
    await sock.sendPresenceUpdate('available');
  }
};

export default alwaysonline;
