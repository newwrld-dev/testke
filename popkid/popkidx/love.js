import config from '../../config.cjs';

const images = {
  default: 'https://files.catbox.moe/syekq2.jpg'
};

const messages = {
  love: (name) => `
┏━━━━━━━━━━━━━━━━━━━┓
┃ ❤️  *A Little Love*  ❤️ 
┃                       
┃ Hey *${name}*,           
┃ Here's some warmth 💕  
┃ to brighten your day!   
┃                       
┃ Stay amazing! ✨         
┗━━━━━━━━━━━━━━━━━━━┛
`.trim(),

  goodmorning: (name) => `
┏━━━━━━━━━━━━━━━━━━━━┓
┃ ☀️  *Good Morning!*  ☀️ 
┃                        
┃ Rise and shine, *${name}*!
┃ May your day be filled   
┃ with joy and good vibes! 
┃                        
┃ Have a wonderful day!    
┗━━━━━━━━━━━━━━━━━━━━┛
`.trim(),

  goodnight: (name) => `
┏━━━━━━━━━━━━━━━━━━━┓
┃ 🌙  *Good Night*  🌙 
┃                       
┃ Sweet dreams, *${name}*! 
┃ May your sleep be calm  
┃ and your rest peaceful. 
┃                       
┃ See you tomorrow! ✨    
┗━━━━━━━━━━━━━━━━━━━┛
`.trim(),
};

const personality = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const senderName = m.pushName || 'User';

  if (!['love', 'goodmorning', 'goodnight'].includes(cmd)) return;

  const caption = messages[cmd](senderName);

  await sock.sendMessage(m.from, {
    image: { url: images.default },
    caption,
    contextInfo: {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: 'ᴘᴏᴘᴋɪᴅ ᴍᴅ',
        newsletterJid: '120363289379419860@newsletter',
      },
    },
  }, { quoted: m });
};

export default personality;
