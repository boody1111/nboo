const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "تاج",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "تاج تلقائي كل 15 ثانية",
    commandCategory: "خدمات",
    usages: "تاج",
    cooldowns: 0
};

const dataPath = path.join(__dirname, "..", "..", "hitler.js");
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
const ADMINID = "61587844010188";

function loadData() {
    delete require.cache[require.resolve(dataPath)];
    return require(dataPath);
}

function saveData(d) {
    fs.writeFileSync(dataPath, `module.exports = ${JSON.stringify(d, null, 2)};`);
}

function startTag(threadID, api) {
    if (global.tagIntervals[threadID]) clearInterval(global.tagIntervals[threadID]);

    global.tagIntervals[threadID] = setInterval(() => {
        api.sendMessage(tagText, threadID).catch(() => {});
    }, 15000);

    const d = loadData();
    d.tagThreads = d.tagThreads || [];
    if (!d.tagThreads.includes(threadID)) {
        d.tagThreads.push(threadID);
        saveData(d);
    }
}

function stopTag(threadID) {
    if (global.tagIntervals[threadID]) {
        clearInterval(global.tagIntervals[threadID]);
        delete global.tagIntervals[threadID];
    }

    const d = loadData();
    d.tagThreads = d.tagThreads || [];
    const idx = d.tagThreads.indexOf(threadID);
    if (idx !== -1) d.tagThreads.splice(idx, 1);
    saveData(d);
}

module.exports.run = async ({ api, event }) => {
    const { threadID, senderID, body } = event;
    if (senderID !== ADMINID) return;

    if (body === "تاج") {
        startTag(threadID, api);
        return api.sendMessage("✅ تم تشغيل التاج كل 15 ثانية", threadID);
    }
    if (body === "تاج وقف") {
        stopTag(threadID);
        return api.sendMessage("⛔ تم إيقاف التاج", threadID);
    }
};

module.exports.onLoad = async ({ api }) => {
    const d = loadData();
    if (!Array.isArray(d.tagThreads)) return;
    for (const threadID of d.tagThreads) startTag(threadID, api);
};