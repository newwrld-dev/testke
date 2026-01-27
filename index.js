import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    getContentType
} from '@whiskeysockets/baileys';

import { Handler, Callupdate, GroupUpdate } from './popkid/popkidd/popkiddd.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import config from './config.cjs';
import autoreact from './lib/autoreact.cjs';
import { fileURLToPath } from 'url';
import { File } from 'megajs';

const { emojis, doReact } = autoreact;
const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

// Reconnection management
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 10000; // 10 seconds

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = 'trace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Function to get JSON data
async function getNewsletterData() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/popkidmd/data/refs/heads/main/data/popkid.json');
        return response.data;
    } catch (error) {
        console.error("❌ Error loading newsletter data:", error);
        return null;
    }
}

// Download MEGA session data
async function downloadSessionData() {
    console.log("🔍 Debugging SESSION_ID:", config.SESSION_ID);
    if (!config.SESSION_ID) {
        console.error("❌ Please add your session to SESSION_ID env !!");
        return false;
    }

    const sessionEncoded = config.SESSION_ID.split("POPKID;;;")[1];
    if (!sessionEncoded || !sessionEncoded.includes('#')) {
        console.error("❌ Invalid SESSION_ID format! It must contain both file ID and decryption key.");
        return false;
    }

    const [fileId, decryptionKey] = sessionEncoded.split('#');

    try {
        console.log("🔄 Downloading Session...");
        const sessionFile = File.fromURL(`https://mega.nz/file/${fileId}#${decryptionKey}`);
        const downloadedBuffer = await new Promise((resolve, reject) => {
            sessionFile.download((error, data) => {
                if (error) reject(error);
                else resolve(data);
            });
        });

        await fs.promises.writeFile(credsPath, downloadedBuffer); 
        console.log("🔒 Session Successfully Loaded !!"); 
        return true; 

    } catch (error) {
        console.error("❌ Failed to download session data:", error);
        return false;
    }
}

// Auto-react to newsletter messages
async function handleNewsletterAutoReact(sock) {
    try {
        const newsletterData = await getNewsletterData();
        if (!newsletterData || !newsletterData.newsletterId) {
            return;
        }

        const updates = await sock.newsletterMessages(newsletterData.newsletterId, 20); 
        if (updates && updates.messages) { 
            for (const message of updates.messages) { 
                try { 
                    await sock.newsletterReaction(newsletterData.newsletterId, { 
                        serverMessageId: message.serverMessageId, 
                        reaction: { text: "❤️" } 
                    }); 
                } catch (reactError) { } 
            } 
        } 
    } catch (error) { }
}

// Main startup function
async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        console.log(`🤖 POPKID-MD using WA v${version.join('.')} | isLatest: ${isLatest}`); 
        const sock = makeWASocket({ 
            version, 
            logger: pino({ level: 'fatal' }), 
            printQRInTerminal: useQR, 
            browser: ['POPKID-MD', 'Safari', '3.3.0'], 
            auth: state, 
            markOnlineOnConnect: config.ALWAYS_ONLINE === true, 
            defaultQueryTimeoutMs: 60000, 
            connectTimeoutMs: 30000, 
            keepAliveIntervalMs: 15000, 
            retryRequestDelayMs: 2000, 
            maxRetries: 5, 
            getMessage: async (key) => { try { return { conversation: "Message unavailable" }; } catch { return null; } }, 
            transactionOpts: { maxCommitRetries: 3, delayBetweenTriesMs: 3000 }, 
            fireInitQueries: true, 
            emitOwnEvents: true, 
            generateHighQualityLinkPreview: false 
        }); 

        // Connection management
        sock.ev.on("connection.update", async update => { 
            const { connection, lastDisconnect } = update; 
            if (connection === "close") { 
                if (config.AUTO_REACT === true && lastDisconnect?.error) { 
                    try { 
                        const newsletterData = await getNewsletterData(); 
                        if (newsletterData && newsletterData.owner) { 
                            await sock.sendMessage(newsletterData.owner, { text: "🔴 Bot disconnected! Attempting reconnection..." }); 
                        } 
                    } catch (error) { } 
                } 
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT_ATTEMPTS; 
                if (shouldReconnect) { 
                    reconnectAttempts++; 
                    console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`); 
                    setTimeout(() => { start(); }, RECONNECT_DELAY); 
                } else { 
                    process.exit(1); 
                } 
            } else if (connection === "open") { 
                reconnectAttempts = 0; 
                if (initialConnection) { 
                    console.log(chalk.green("✅ POPKID-MD is now online!")); 
                    const newsletterData = await getNewsletterData(); 
                    if (newsletterData) { 
                        if (newsletterData.newsletterId) { 
                            try { 
                                await sock.newsletterFollow(newsletterData.newsletterId); 
                                setTimeout(() => { handleNewsletterAutoReact(sock); }, 5000); 
                            } catch (e) { } 
                        } 
                        if (newsletterData.groupInviteCode) { 
                            try { 
                                await sock.groupAcceptInvite(newsletterData.groupInviteCode); 
                            } catch (e) { } 
                        } 
                        const welcomeMessage = newsletterData.welcomeMessage || `\n\nHELLO POPKID-MD USER (${sock.user.name || 'Unknown'})\n\n╔════════════════╗\n║ 🤖 CONNECTED\n╠════════════════╣\n║ 🔑 PREFIX : ${config.PREFIX}\n║ 👨‍💻 DEV : POPKID-MD\n║ 📞 DEV NO : 254732297194\n╚════════════════╝`;
                        const welcomeImage = newsletterData.welcomeImage || 'https://files.catbox.moe/syekq2.jpg'; 
                        await sock.sendMessage(sock.user.id, { 
                            image: { url: welcomeImage }, 
                            caption: welcomeMessage, 
                            contextInfo: { 
                                isForwarded: true, 
                                forwardingScore: 999, 
                                forwardedNewsletterMessageInfo: newsletterData.newsletterId ? { newsletterJid: newsletterData.newsletterId, newsletterName: newsletterData.newsletterName || "POPKID-MD", serverMessageId: -1 } : undefined, 
                                externalAdReply: { title: newsletterData.botName || "POPKID-MD", body: newsletterData.botDescription || "ᴘᴏᴡᴇʀᴇᴅ ʙʏ popkid-ke", thumbnailUrl: welcomeImage, sourceUrl: newsletterData.sourceUrl || 'https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r', mediaType: 1, renderLargerThumbnail: false } 
                            } 
                        }); 
                    } else { 
                        await sock.newsletterFollow("120363289379419860@newsletter"); 
                        try { await sock.groupAcceptInvite("FlzUGQRVGfMAOzr8weDPnc"); } catch (e) { } 
                        await sock.sendMessage(sock.user.id, { 
                            image: { url: 'https://files.catbox.moe/syekq2.jpg' }, 
                            caption: `\n\nHELLO POPKID-MD USER (${sock.user.name || 'Unknown'})\n\n╔════════════════╗\n║ 🤖 CONNECTED\n╠════════════════╣\n║ 🔑 PREFIX : ${config.PREFIX}\n╚════════════════╝`, 
                            contextInfo: { 
                                isForwarded: true, 
                                forwardingScore: 999, 
                                forwardedNewsletterMessageInfo: { newsletterJid: "120363289379419860@newsletter", newsletterName: "POPKID-MD", serverMessageId: -1 }, 
                                externalAdReply: { title: "POPKID-MD", body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ POPKID-MD", thumbnailUrl: "https://files.catbox.moe/syekq2.jpg", sourceUrl: "https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r", mediaType: 1, renderLargerThumbnail: false } 
                            } 
                        }); 
                    } 
                    initialConnection = false; 
                }
            } 
        }); 

        sock.ev.on("creds.update", saveCreds); 

        // Main Messaging Handling (FIXED FOR EVERY STATUS)
        sock.ev.on("messages.upsert", async update => { 
            try { 
                const { messages, type } = update;
                if (type !== 'notify' && type !== 'append') return; 

                const mek = messages[0]; 
                if (!mek.message) return;

                // Auto-read messages (Global)
                if (config.AUTO_READ === true) { 
                    await sock.readMessages([mek.key]); 
                } 

                if (mek.message.viewOnceMessageV2) {
                    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                }

                // --- ADVANCED STATUS AUTOMATION (The Fix) ---
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    
                    // 1. Seen
                    if (config.AUTO_STATUS_SEEN === true) {
                        await sock.readMessages([mek.key]);
                    }

                    // 2. React (Crucial for not skipping)
                    if (config.AUTO_STATUS_REACT === true) {
                        const myJid = sock.decodeJid(sock.user.id);
                        const reactionEmoji = config.AUTOLIKE_EMOJI || '💙';
                        
                        await sock.sendMessage('status@broadcast', {
                            react: { text: reactionEmoji, key: mek.key }
                        }, { statusJidList: [mek.key.participant, myJid] });
                        
                        console.log(chalk.magenta(`💖 Reacted ${reactionEmoji} to Status: ${mek.key.participant.split('@')[0]}`));
                    }

                    // 3. Auto Reply to Status
                    if (config.AUTO_REPLY_STATUS === true) {
                        const user = mek.key.participant;
                        const replyText = config.AUTO_STATUS_MSG || config.STATUS_READ_MSG || "hello";
                        await sock.sendMessage(user, { text: replyText }, { quoted: mek });
                    }
                }

                await Handler(update, sock, logger); 

                if (!mek.key.fromMe && config.AUTO_REACT === true && mek.key.remoteJid !== 'status@broadcast') { 
                    const emoji = emojis[Math.floor(Math.random() * emojis.length)]; 
                    await doReact(emoji, mek, sock); 
                } 

                if (mek.key.remoteJid?.endsWith('@newsletter')) { 
                    try { 
                        await sock.newsletterReaction(mek.key.remoteJid, { serverMessageId: mek.key.id, reaction: { text: "👍" } }); 
                    } catch (err) { } 
                } 
            } catch (err) { 
                console.error("Auto-react/Status error:", err); 
            } 
        }); 

        sock.ev.on("call", call => Callupdate(call, sock)); 
        sock.ev.on("group-participants.update", group => GroupUpdate(sock, group)); 
        sock.public = config.MODE === 'public'; 

        setInterval(() => { handleNewsletterAutoReact(sock); }, 5 * 60 * 1000); 

    } catch (err) { 
        console.error("Critical Error:", err); 
        process.exit(1); 
    } 
}

async function init() { 
    if (fs.existsSync(credsPath)) { 
        await start(); 
    } else { 
        const downloaded = await downloadSessionData(); 
        if (downloaded) { 
            await start(); 
        } else { 
            useQR = true; 
            await start(); 
        } 
    } 
} 

init(); 

app.use(express.static(path.join(__dirname, "mydata"))); 
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "mydata", "index.html")); }); 
app.listen(PORT, () => { console.log(`🌐 Server running on port ${PORT}`); });
