const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "تاج",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "اليكسي",
    description: "تاج تلقائي كل 15 ثانية",
    commandCategory: "خدمات",
    usages: "تاج",
    cooldowns: 0
};

const tagText = `𝐴.R  ┋AI bot ┋ 
الرد التلقائي 
*𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆*

رد آلي
𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆
𝙆 →┊✘┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙉 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊✘┊𝙆 →┊ ☠︎︎ ┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙉 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊ ☠︎︎ ┊𝙆 →┊ ☠︎︎ ┊ → 𝙎 →┊✘┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 →┊✘┊→ 𝙉 →┊ ☠︎︎ ┊→ 𝙆 →┊✘┊→ 𝙈 → 𝙆┊ ☠︎︎ ┊𝙆 →┊✘┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙉 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊✘┊𝙆 →┊ ☠︎︎ ┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 
𝙆 →┊✘┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊✘┊𝙆 →┊ ☠︎︎ ┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 →┊┊→ 𝙉 →┊ ☠︎︎៵☬
   
𝐦𝐢𝐥𝐢𝐭𝐢𝐚 𝐥𝐞𝐚𝐝𝐞𝐫 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤🕸🫅🏻 

《🛞》  ⭒ ➠ ┇.𝐂𝐡𝐫𝐨𝐥𝐥𝐨 𝐋𝐮𝐜𝐢𝐥𝐟𝐞𝐫 𝐇𝐢𝐭𝐥𝐞𝐫
┋➣┋      《🥷🏻》

     
.         .     𝑪𝒉𝒓𝒐𝒍𝒍𝒐 𝑳𝒖𝒄𝒊𝒍𝒇𝒆𝒓 𝑯𝒊𝒕𝒍𝒆𝒓𝕾.㊑!`;

global.tagIntervals = global.tagIntervals || {};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, senderID } = event;
    const botID = api.getCurrentUserID();
    const botInstance = global.apiInstances.get(botID);
    const ADMINS = botInstance ? botInstance.config.ADMINBOT : global.config.ADMINBOT;

    if (!ADMINS.includes(senderID)) return;

    if (args[0] === "وقف") {
        if (global.tagIntervals[threadID]) {
            clearInterval(global.tagIntervals[threadID]);
            delete global.tagIntervals[threadID];
            return api.sendMessage("⛔ تم إيقاف التاج", threadID);
        }
        return api.sendMessage("التاج متوقف بالفعل", threadID);
    }

    if (global.tagIntervals[threadID]) clearInterval(global.tagIntervals[threadID]);

    global.tagIntervals[threadID] = setInterval(() => {
        api.sendMessage(tagText, threadID).catch(() => {});
    }, 15000);

    return api.sendMessage("✅ تم تشغيل التاج كل 15 ثانية", threadID);
};