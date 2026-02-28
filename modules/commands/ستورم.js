const axios = require('axios');
module.exports = {
  name: 'ستورم',
  description: 'اسأل سؤالك لـ الملك العظيم ستورم',
  author: '𝙸𝙷𝙰𝙱 (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join( );
    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/gpt4?prompt=${encodeURIComponent(prompt)}&uid=100${senderId}`;
      const response = await axios.get(apiUrl);
      const text = response.data.gpt4;

      // Split the response into chunks if it exceeds 2000 characters
      const maxMessageLength = 2000;
      if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);
        for (const message of messages) {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text }, pageAccessToken);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء استدعاء واجهة برمجة التطبيقات الخاصة بـ ستورم:', error);
      sendMessage(senderId, { text: 'يرجى كتابة الموضوع الذي تريد منا الحديث عنه أو أي أسئلة تريد طرحها للملك ستورم 👑🤖' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
