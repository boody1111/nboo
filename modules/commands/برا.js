module.exports.config = {
  name: "برا",
  version: "1.0.0",
  hasPermssion: 2, // ✅ ادمن بوت فقط
  credits: "وســـــــــكي",
  description: "يخلي البوت يخرج من الجروب",
  commandCategory: "إدارة",
  usages: "",
  cooldowns: 0
};

module.exports.run = async ({ api, event }) => {
  const { threadID, senderID } = event;

  const ADMINBOT = global.config.ADMINBOT || [];

  // حماية إضافية
  if (!ADMINBOT.includes(senderID)) {
    return api.sendMessage(
      "❌ الأمر ده خاص بالمطوّر فقط.",
      threadID
    );
  }

  // رسالة فخمة قبل الخروج
  await api.sendMessage(
`👑✨ أمرك مُطاع يا مطوّري العزيز ✨👑

🚪 أنا خارج من الجروب حالًا…
⚡ كان شرف ليا أكون هنا

🔥 إلى لقاءٍ قريب`,
    threadID
  );

  // تأخير بسيط ثم خروج
  setTimeout(() => {
    api.removeUserFromGroup(api.getCurrentUserID(), threadID);
  }, 1500);
};