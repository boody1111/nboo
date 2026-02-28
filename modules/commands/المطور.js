module.exports.config = {
    name: "المطور",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "معلومات مطور البوت",
    commandCategory: "معلومات",
    usages: "المطور",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const message = `👨‍💻✨ معلومات مطور البوت ✨👨‍💻

━━━━━━━━━━━━━━━

👤 ✨ اسم المطور:  
『 اربرت ساما 』

🌍 ✨ الجنسية:  
『 سوريا 🇸🇾 』

🎂 ✨ العمر:  
『 18 سنة 』

🤖 ✨ اسم البوت:  
『 اليكسي 』

🕷️💥 ✨ المهنة:  
『 نـــ ــكح كروبات وتدميرها 』
[تغير كنيات، جرايد، اسم كروب] • ALIX BOT

🔗 ✨ رابط الحساب:  
 https://www.facebook.com/profile.php?id=61586136308492

━━━━━━━━━━━━━━
Illıllı ✨ تمت برمجته بكل حب من المطور اربرت ساما 🥷🏻🔦 Illıllı

✨🤡😉 اتمنى لكم الاستمتاع!`;

    return api.sendMessage(message, event.threadID);
};