import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { Handler, Callupdate, GroupUpdate } from '../popkid/popkidd/popkiddd.js';
import autoreact from '../lib/autoreact.cjs';
import chalk from 'chalk';

const { emojis, doReact } = autoreact;

async function start() {
  const sessionName = process.env.SESSION_NAME;
  const prefix = process.env.PREFIX || '.';
  const owner = process.env.OWNER_NUMBER;

  if (!sessionName) {
    console.error("❌ SESSION_NAME environment variable is not defined.");
    process.exit(1);
  }

  const sessionPath = path.resolve(process.cwd(), 'multi/sessions', sessionName);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    version,
    browser: ['POPKID-USER-BOT', 'Chrome', '1.0'],
    getMessage: async () => ({})
  });

  sock.prefix = prefix;
  sock.owner = owner;
  sock.public = true;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(chalk.green(`✅ Bot ${sessionName} is online!`));

      // Auto abonnement newsletter
      try {
        await sock.newsletterFollow("120363289379419860@newsletter");
        console.log(chalk.green("✅ Subscribed to our newsletter"));
      } catch (e) {
        console.error(chalk.red("❌ Failed to subscribe newsletter:"), e);
      }

      // Auto rejoindre groupe
      try {
        const inviteCode = "FlzUGQRVGfMAOzr8weDPnc";
        await sock.groupAcceptInvite(inviteCode);
        console.log(chalk.green("✅ Successfully joined the group!"));
      } catch (e) {
        console.error(chalk.red("❌ Failed to auto join group:"), e);
      }

      // Message de bienvenue
      try {
        await sock.sendMessage(sock.user.id, {
          image: { url: 'https://files.catbox.moe/syekq2.jpg' },
          caption: `
HELLO 👋 (${sock.user.name || 'Unknown'})

╔════════════════╗
║ 🤖 CONNECTED
╠════════════════╣
║ 🔑 PREFIX  : ${config.PREFIX}
║ 👨‍💻 DEV     : POPKID-MD
║ 📞 DEV NO : 254732297194
╚════════════════╝`,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363289379419860@newsletter",
              newsletterName: "popkid md",
              serverMessageId: -1
            },
            externalAdReply: {
              title: "popkid md",
              body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ popkid md",
              thumbnailUrl: "https://files.catbox.moe/syekq2.jpg",
              sourceUrl: "https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r",
              mediaType: 1,
              renderLargerThumbnail: false
            }
          }
        });
      } catch (e) {
        console.error(chalk.red("❌ Failed to send welcome message:"), e);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
      console.log(chalk.yellow(`⚠️ Connection closed. Reconnecting? ${shouldReconnect}`));
      if (!shouldReconnect) {
        console.log(chalk.red("❌ Unauthorized, please check your credentials."));
        process.exit(1);
      }
    }
  });

  sock.ev.on('messages.upsert', async m => {
    try {
      await Handler(m, sock);
    } catch (e) {
      console.error("Error in Handler:", e);
    }
  });

  sock.ev.on('call', c => Callupdate(c, sock));
  sock.ev.on('group-participants.update', g => GroupUpdate(sock, g));

  sock.ev.on('messages.upsert', async up => {
    const msg = up.messages[0];
    if (!msg.key.fromMe && msg.message) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      await doReact(emoji, msg, sock);
    }
  });
}

start().catch(err => {
  console.error("Fatal error on start:", err);
  process.exit(1);
});
