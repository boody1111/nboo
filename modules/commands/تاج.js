const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "تاج",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "اليكسي",
    description: "تاج تلقائي كل 15 ثانية مع حفظ الإعدادات",
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

function getHitlerPath(api) {
    const botID = api.getCurrentUserID();
    return path.join(__dirname, "..", "..", `hitler_${botID}.js`);
}

function loadData(api) {
    const filePath = getHitlerPath(api);
    if (!fs.existsSync(filePath)) return { tagThreads: [] };
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
}

function saveData(api, data) {
    const filePath = getHitlerPath(api);
    fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(data, null, 2)};`);
}

function startTag(api, threadID) {
    if (global.tagIntervals[threadID]) clearInterval(global.tagIntervals[threadID]);
    global.tagIntervals[threadID] = setInterval(() => {
        api.sendMessage(tagText, threadID).catch(() => {});
    }, 15000);
}

module.exports.run = async ({ api, event, args }) => {
    const { threadID, senderID } = event;
    const botID = api.getCurrentUserID();
    const instance = global.apiInstances.get(botID);
    const ADMINS = instance ? instance.config.ADMINBOT : global.config.ADMINBOT;

    if (!ADMINS.includes(senderID)) return;

    let data = loadData(api);
    data.tagThreads = data.tagThreads || [];

    if (args[0] === "وقف") {
        if (global.tagIntervals[threadID]) {
            clearInterval(global.tagIntervals[threadID]);
            delete global.tagIntervals[threadID];
            data.tagThreads = data.tagThreads.filter(id => id !== threadID);
            saveData(api, data);
            return api.sendMessage("⛔ تم إيقاف التاج وحذفه من الحفظ", threadID);
        }
        return api.sendMessage("التاج متوقف بالفعل", threadID);
    }

    startTag(api, threadID);
    if (!data.tagThreads.includes(threadID)) {
        data.tagThreads.push(threadID);
        saveData(api, data);
    }

    return api.sendMessage("✅ تم تشغيل التاج وحفظه للعمل تلقائياً عند إعادة التشغيل", threadID);
};

module.exports.onLoad = async ({ api }) => {
    const data = loadData(api);
    if (Array.isArray(data.tagThreads)) {
        for (const threadID of data.tagThreads) {
            startTag(api, threadID);
        }
    }
};