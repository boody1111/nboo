const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "جرايد",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "إرسال جرايد تلقائيًا بدون توقف",
    commandCategory: "خدمات",
    usages: "جرايد",
    cooldowns: 0
};

// مسار ملف hitler.js
const hitlerPath = path.join(__dirname, "..", "..", "hitler.js");

// نص الجرايد
const jrayedText = `𝐴.R  ┋AI bot ┋ 
الرد التلقائي 
*𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆*

رد آلي
𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆
𝙆 →┊✘┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙉 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊✘┊𝙆 →┊ ☠︎︎ ┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙉 →┊✘┊→ 𝙆 →┊ ☠︎︎ ┊→ 𝙈 → 𝙆┊ ☠︎︎ ┊𝙆 →┊ ☠︎︎ ┊ → 𝙎 →┊✘┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 →┊✘┊→ 𝙉 →┊ ☠︎︎ ┊→ 𝙆 →┊✘┊→ 𝙈 → 𝙆┊ ☠︎︎ ┊𝙆 →┊✘┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 → ☠︎︎ ┊→ 𝙈 → 𝙆┊✘┊𝙆 →┊ ☠︎︎ ┊→ 𝙎 →┊ ☠︎︎ ┊→ 𝙈 →┊ ☠︎︎ ┊→ 𝙆 →┊┊→ 𝙉 →┊ ☠︎︎៵☬
   
𝐦𝐢𝐥𝐢𝐭𝐢𝐚 𝐥𝐞𝐚𝐝𝐞𝐫 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤🕸🫅🏻 

《🛞》  ⭒ ➠ ┇.𝐂𝐡𝐫𝐨𝐥𝐥𝐨 𝐋𝐮𝐜𝐢𝐥𝐟𝐞𝐫 𝐇𝐢𝐭𝐥𝐞𝐫
┋➣┋      《🥷🏻》

     
.         .     𝑪𝒉𝒓𝒐𝒍𝒍𝒐 𝑳𝒖𝒄𝒊𝒍𝒇𝒆𝒓 𝑯𝒊𝒕𝒍𝒆𝒓𝕾.㊑!`;

global.jrayedIntervals = global.jrayedIntervals || {};
const ADMINID = "61586285835498"; // ID الأدمن (أنت)

// تحميل hitler
function loadHitler() {
    delete require.cache[require.resolve(hitlerPath)];
    return require(hitlerPath);
}

// حفظ hitler
function saveHitler(data) {
    fs.writeFileSync(hitlerPath, `module.exports = ${JSON.stringify(data, null, 2)};`);
}

// بدء الجرايد
function startJrayed(threadID, api) {
    if (global.jrayedIntervals[threadID]) clearInterval(global.jrayedIntervals[threadID]);

    const interval = setInterval(() => {
        api.sendMessage(jrayedText, threadID).catch(() => {});
    }, 8000);

    global.jrayedIntervals[threadID] = interval;

    const hitlerData = loadHitler();
    if (!hitlerData.threadIDs.includes(threadID)) {
        hitlerData.threadIDs.push(threadID);
        saveHitler(hitlerData);
    }
}

// إيقاف الجرايد
function stopJrayed(threadID) {
    if (global.jrayedIntervals[threadID]) {
        clearInterval(global.jrayedIntervals[threadID]);
        delete global.jrayedIntervals[threadID];
    }

    const hitlerData = loadHitler();
    const index = hitlerData.threadIDs.indexOf(threadID);
    if (index !== -1) {
        hitlerData.threadIDs.splice(index, 1);
        saveHitler(hitlerData);
    }
}

// تنفيذ أمر الجرايد
module.exports.run = async ({ api, event }) => {
    const { threadID, senderID } = event;

    // صلاحية الأدمن فقط
    if (senderID !== ADMINID) 
        return api.sendMessage("❌ ليس لديك صلاحية لاستخدام أمر جرايد", threadID);

    if (global.jrayedIntervals[threadID]) {
        stopJrayed(threadID);
        return api.sendMessage(`تم إيقاف الجرايد ✅ من الكروب: ${threadID}`, threadID);
    }

    startJrayed(threadID, api);
    return api.sendMessage(`تم تشغيل الجرايد 🚀 الرسالة ترسل كل 8 ثواني في الكروب: ${threadID}`, threadID);
};

// دعم إيقاف الجرايد عن طريق الحدث "جرايد هرب"
module.exports.handleEvent = async ({ api, event }) => {
    if (event.senderID !== ADMINID) return;

    if (event.body?.toLowerCase() === "جرايد هرب") {
        stopJrayed(event.threadID);
        return api.sendMessage(`تم إيقاف الجرايد 👋 من الكروب: ${event.threadID}`, event.threadID);
    }
};

// تشغيل الجرايد تلقائيًا بعد Restart
module.exports.onLoad = async ({ api }) => {
    const hitlerData = loadHitler();
    if (Array.isArray(hitlerData.threadIDs)) {
        for (const threadID of hitlerData.threadIDs) {
            startJrayed(threadID, api);
        }
    }
};