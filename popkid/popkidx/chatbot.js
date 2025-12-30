import axios from 'axios';
import config from '../../config.cjs';

// Main command function
const chatbotcommand = async (m, Matrix) => {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
        ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
        : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // chatbot on/off command
    if (cmd === 'chatbot') {
        if (!isCreator) return m.reply("*Only admin*");

        let responseMessage;

        if (text === 'on') {
            config.CHATBOT = true;
            responseMessage = "Chatbot has been enabled.";
        } else if (text === 'off') {
            config.CHATBOT = false;
            responseMessage = "Chatbot has been disabled.";
        } else {
            responseMessage =
                "Usage:\n- `chatbot on`: Enable Chatbot\n- `chatbot off`: Disable Chatbot";
        }

        try {
            await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
        } catch (error) {
            console.error("Error processing your request:", error);
            await Matrix.sendMessage(
                m.from,
                { text: 'Error processing your request.' },
                { quoted: m }
            );
        }
    }

    // Chatbot auto-reply logic
    if (config.CHATBOT) {
        const mek = m;
        if (!mek.message || mek.key.fromMe) return;

        const from = mek.key.remoteJid;
        const sender = mek.key.participant || from;
        const isGroup = from.endsWith('@g.us');
        const msgText = mek.body || '';

        // In groups: respond only if mentioned or replied to
        if (isGroup) {
            const context = mek.message?.extendedTextMessage?.contextInfo;
            const isMentioned = context?.mentionedJid?.includes(Matrix.user.id);
            const isQuoted = context?.participant === Matrix.user.id;
            const isReplied =
                context?.stanzaId && context?.participant === Matrix.user.id;

            if (!isMentioned && !isQuoted && !isReplied) return;
        }

        // Chat memory storage
        if (!global.userChats) global.userChats = {};
        if (!global.userChats[sender]) global.userChats[sender] = [];

        global.userChats[sender].push(`User: ${msgText}`);

        if (global.userChats[sender].length > 15) {
            global.userChats[sender].shift();
        }

        const userHistory = global.userChats[sender].join("\n");

        const prompt = `
You are popkid md bot, a friendly WhatsApp bot.

### Conversation History:
${userHistory}
        `;

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

            await Matrix.sendMessage(from, { text: botResponse }, { quoted: mek });
        } catch (error) {
            console.error('Error in chatbot response:', error);
            await Matrix.sendMessage(
                from,
                { text: 'Error processing your request.' },
                { quoted: mek }
            );
        }
    }
};

export default chatbotcommand;
