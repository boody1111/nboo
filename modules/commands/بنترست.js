const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'بنترست',
  description: 'ابحث عن الصور في بنترست.',
  usage: 'بنترست: [كلمة] - عدد الصور',
  author: '𝙸𝙷𝙰𝙱',

  async execute(senderId, args) {
    // Ensure args is defined and is an array, default to an empty string if not
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    // Handle the case where user provides a search query and optional number of images
    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 5;

    // Ensure the user-requested count is within 1 to 20
    imageCount = Math.max(1, Math.min(imageCount, 20));

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      // Limit the number of images to the user-requested count
      const selectedImages = data.data.slice(0, imageCount);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `لـم يتـم العثـور على صـور لـ "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Send each image in a separate message
      for (const url of selectedImages) {
        const attachment = {
          type: 'image',
          payload: { url }
        };
        await sendMessage(senderId, { attachment }, pageAccessToken);
      }

    } catch (error) {
      console.error('خطأ:', error);
      await sendMessage(senderId, { text: 'خطأ: تعذر جلب الصور' }, pageAccessToken);
    }
  }
};
