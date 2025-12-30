import config from '../../config.cjs';

const tagEveryoneInGroup = async (message, sock) => {
  const prefix = config.PREFIX;
  const cmd = message.body.startsWith(prefix)
    ? message.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'tagall') return;

  if (!message.isGroup) {
    return await sock.sendMessage(
      message.from,
      { text: '🚫 group command.' },
      { quoted: message }
    );
  }

  try {
    const groupMeta = await sock.groupMetadata(message.from);
    const participants = groupMeta.participants;
    const senderId = message.sender;

    // Image de secours en cas d'erreur
    const fallbackImage = 'https://files.catbox.moe/syekq2.jpg';

    // Essaie de récupérer la photo de profil du créateur du message
    let profilePicture = fallbackImage;
    try {
      profilePicture = await sock.profilePictureUrl(senderId, 'image');
    } catch (e) {
      profilePicture = fallbackImage; // Utilise l'image de secours si erreur
    }

    const mentions = participants.map(p => p.id);
    const adminCount = participants.filter(p => p.admin).length;
    const senderName = senderId.split('@')[0];
    const rawText = message.body.trim().split(' ').slice(1).join(' ');
    const userText = rawText || 'Blanc';
    const tagList = mentions.map(id => `@${id.split('@')[0]}`).join('\n');

    const caption = `
╭───────◇
│ *ᴘᴏᴘᴋɪᴅ ᴍᴅ*
╰───────◇

👥 *Groupe* : ${groupMeta.subject}
👤 *Auteur* : @${senderName}
👨‍👩‍👧‍👦 *Membres* : ${participants.length}
🛡️ *Admins* : ${adminCount}

🗒️ *Message* :
${userText}

${tagList}

> ᴘᴏᴘᴋɪᴅ ᴍᴅ
`;

    await sock.sendMessage(
      message.from,
      {
        image: { url: profilePicture },
        caption,
        mentions
      },
      { quoted: message }
    );

  } catch (err) {
    console.error('Erreur dans tagall:', err);
    await sock.sendMessage(
      message.from,
      { text: '❌ Une erreur est survenue lors du tag.' },
      { quoted: message }
    );
  }
};

export default tagEveryoneInGroup;
