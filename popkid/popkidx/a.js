const config = require('../../config.cjs');
const runtimeState = require('../../lib/runtimeState.js');

const statusCommands = async (m, Matrix) => {
  if (!m.body) return;

  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);

  const prefix = config.PREFIX;
  if (!m.body.startsWith(prefix)) return;

  const args = m.body.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (!isCreator) {
    return Matrix.sendMessage(m.from, { text: "📛 THIS IS AN OWNER COMMAND" }, { quoted: m });
  }

  const toggle = (stateKey, intervalKey, presenceType, textEnabled, textDisabled) => {
    if (args[0] === 'on') {
      if (!runtimeState[stateKey]) {
        runtimeState[stateKey] = true;
        runtimeState[intervalKey] = setInterval(async () => {
          try {
            await Matrix.sendPresenceUpdate(presenceType, m.from);
          } catch (err) {
            console.error(`[${stateKey} ERROR]`, err);
          }
        }, 2000); // repeat every 2 seconds
      }
      return Matrix.sendMessage(m.from, { text: textEnabled }, { quoted: m });
    }
    if (args[0] === 'off') {
      runtimeState[stateKey] = false;
      if (runtimeState[intervalKey]) {
        clearInterval(runtimeState[intervalKey]);
        runtimeState[intervalKey] = null;
      }
      return Matrix.sendMessage(m.from, { text: textDisabled }, { quoted: m });
    }
    return Matrix.sendMessage(
      m.from,
      { text: '*Usage:*\n.on/off commands' },
      { quoted: m }
    );
  };

  switch (cmd) {
    case 'autotyping':
      return toggle(
        'AUTO_TYPING',
        'TYPING_INTERVAL',
        'composing',
        '✅ Auto-Typing Enabled',
        '❌ Auto-Typing Disabled'
      );

    case 'autorecording':
      return toggle(
        'AUTO_RECORDING',
        'RECORDING_INTERVAL',
        'recording',
        '✅ Auto-Recording Enabled',
        '❌ Auto-Recording Disabled'
      );

    case 'online':
      return toggle(
        'ALWAYS_ONLINE',
        'ONLINE_INTERVAL',
        'available',
        '✅ Always Online Enabled',
        '❌ Always Online Disabled'
      );

    default:
      return; // ignore other commands
  }
};

module.exports = statusCommands;
