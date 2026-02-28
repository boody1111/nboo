const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "هتلر",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "اليكسي",
  description: "تغيير كنيات الأعضاء مع حفظ الإعدادات والحماية",
  commandCategory: "إدارة",
  usages: "[الكنية]",
  cooldowns: 0
};

global.hitlerNick = global.hitlerNick || new Map();

function getHitlerPath(api) {
    const botID = api.getCurrentUserID();
    return path.join(__dirname, "..", "..", `hitler_${botID}.js`);
}

function loadData(api) {
    const filePath = getHitlerPath(api);
    if (!fs.existsSync(filePath)) return { hitlerThreads: {} };
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
}

function saveData(api, data) {
    const filePath = getHitlerPath(api);
    fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(data, null, 2)};`);
}

async function startHitler(api, threadID, nickname) {
    global.hitlerNick.set(threadID, { nickname, active: true });
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;

    for (const uid of participantIDs) {
        if (!global.hitlerNick.has(threadID)) break;
        api.changeNickname(nickname, threadID, uid).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    global.hitlerNick.delete(threadID);
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const botID = api.getCurrentUserID();
  const instance = global.apiInstances.get(botID);
  const ADMINS = instance ? instance.config.ADMINBOT : global.config.ADMINBOT;

  if (!ADMINS.includes(senderID)) return;
  
  let data = loadData(api);
  data.hitlerThreads = data.hitlerThreads || {};

  if (args[0] === "وقف") {
    global.hitlerNick.delete(threadID);
    delete data.hitlerThreads[threadID];
    saveData(api, data);
    return api.sendMessage("تـــــم إيقاف تغيير الكنيات وحذفه من الحفظ! ✅", threadID, messageID);
  }

  const nickname = args.join(" ");
  if (!nickname) return api.sendMessage("يرجى إدخال الكنية المطلوبة!", threadID, messageID);

  api.sendMessage(`جـاري تـغيـير كـنيات الأعـضاء إلـى: ${nickname} وحفظ الإعداد... ⏳`, threadID);
  
  data.hitlerThreads[threadID] = nickname;
  saveData(api, data);

  startHitler(api, threadID, nickname);
};

module.exports.handleEvent = async ({ api, event }) => {
    const { threadID, logMessageType, logMessageData } = event;
    if (logMessageType === "log:nickname" && global.hitlerNick && global.hitlerNick.has(threadID)) {
        const data = global.hitlerNick.get(threadID);
        if (logMessageData.nickname !== data.nickname) {
            api.changeNickname(data.nickname, threadID, logMessageData.participant_id).catch(() => {});
        }
    }
};

module.exports.onLoad = async ({ api }) => {
    const data = loadData(api);
    if (data.hitlerThreads) {
        for (const threadID in data.hitlerThreads) {
            startHitler(api, threadID, data.hitlerThreads[threadID]);
        }
    }
};