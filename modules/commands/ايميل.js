const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const domains = ["rteet.com", "1secmail.com", "1secmail.org", "1secmail.net", "wwjmp.com", "esiix.com", "xojxe.com", "yoggm.com"];

module.exports = {
  name: 'ايميل',
  description: 'إنشاء بريد إلكتروني مؤقت وفحص صندوق الوارد',
  usage:  'ايميل(البريد المؤقت)',
  author: '𝙸𝙷𝙰𝙱',

  async execute(senderId, args, pageAccessToken) {
    const [cmd, email] = args;
    if (cmd === 'توليد') {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return sendMessage(senderId, { text: `📧 | الـبريد الإلكتـروني: ${Math.random().toString(36).slice(2, 10)}@${domain}` }, pageAccessToken);
    }

    if (cmd === 'صندوق الوارد' && email && domains.some(d => email.endsWith(`@${d}`))) {
      try {
        const [username, domain] = email.split('@');
        const inbox = (await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`)).data;
        if (!inbox.length) return sendMessage(senderId, { text: 'صنـدوق الوارد فـارغ' }, pageAccessToken);

        const { id, from, subject, date } = inbox[0];
        const { textBody } = (await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${id}`)).data;
        return sendMessage(senderId, { text: `📬 | الـبريد الإلكتـروني:\nمـن: ${from}\nالـموضوع📜: ${subject}\nالـتاريخ🔢: ${date}\n\nالـمحتوى💟:\n${textBody}` }, pageAccessToken);
      } catch {
        return sendMessage(senderId, { text: 'خطأ: غير قادر على جلب صندوق الوارد أو محتوى البريد الإلكتروني' }, pageAccessToken);
      }
    }

    sendMessage(senderId, { text: 'استخدام غير صحيح ، أستخدم - ايميل صندوق الوارد - او - ايميل  توليد < البريد الالكتروني>' }, pageAccessToken);
  },
};
