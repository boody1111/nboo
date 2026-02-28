module.exports.config = {
    name: "مساعدة",
    aliases: ["help", "هلب", "اوامر"],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "اليكسي",
    description: "قائمة الأوامر",
    commandCategory: "نظام",
    usages: "",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    let msg = "✨ قائمة الأوامر المتوفرة ✨\n\n";
    global.client.commands.forEach(cmd => {
        msg += `• ${global.config.PREFIX}${cmd.config.name}: ${cmd.config.description}\n`;
    });
    msg += "\nاستمتع بنسخة 2026 🚀";
    return api.sendMessage(msg, event.threadID);
};