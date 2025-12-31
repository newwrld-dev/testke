import axios from 'axios';
import config from '../../config.cjs';

const chatbotcommand = async (m, Matrix) => {
    // 🚫 Ignore duplicate message IDs
    if (!m.key?.id) return;
    if (global.processedMessages.has(m.key.id)) return;
    global.processedMessages.add(m.key.id);

    // prevent memory leak
    setTimeout(() => {
        global.processedMessages.delete(m.key.id);
    }, 60 * 1000);

    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;

    if (!m.body) return;

    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';

    const text = m.body.slice(prefix.length + cmd.length).trim();

    /* ---------------- CHATBOT ON / OFF ---------------- */
    if (cmd === 'chatbot') {
        if (!isCreator) {
            await Matrix.sendMessage(m.from, { text: "*Only admin*" }, { quoted: m });
            return;
        }

        let responseMessage;

        if (text === 'on') {
            config.CHATBOT = true;
            responseMessage = "Chatbot has been enabled.";
        } else if (text === 'off') {
            config.CHATBOT = false;
            responseMessage = "Chatbot has been disabled.";
        } else {
            responseMessage =
                "Usage:\n- `chatbot on`\n- `chatbot off`";
        }

        await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
        return; // ✅ IMPORTANT — STOP HERE
    }

    /* ---------------- AUTO CHATBOT ---------------- */
    if (!config.CHATBOT) return;
    if (m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const isGroup = from.endsWith('@g.us');
    const msgText = m.body.trim();

    if (!msgText) return;

    // Group logic
    if (isGroup) {
        const context = m.message?.extendedTextMessage?.contextInfo;
        const isMentioned = context?.mentionedJid?.includes(Matrix.user.id);
        const isReplied = context?.participant === Matrix.user.id;

        if (!isMentioned && !isReplied) return;
    }

    // Chat memory
    global.userChats = global.userChats || {};
    global.userChats[sender] = global.userChats[sender] || [];

    global.userChats[sender].push(`User: ${msgText}`);
    if (global.userChats[sender].length > 15) {
        global.userChats[sender].shift();
    }

    try {
        const { data } = await axios.get(
            "https://apis.davidcyriltech.my.id/ai/chatbot",
            {
                params: {
                    query: msgText,
                    apikey: ""
                }
            }
        );

        const botResponse =
            data?.result ||
            data?.response ||
            data?.message ||
            "No response.";

        global.userChats[sender].push(`Bot: ${botResponse}`);

        await Matrix.sendMessage(from, { text: botResponse }, { quoted: m });

    } catch (error) {
        console.error('Chatbot error:', error);
        await Matrix.sendMessage(
            from,
            { text: 'Error processing your request.' },
            { quoted: m }
        );
    }
};

export default chatbotcommand;
