const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تكرار",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "اليكسي",
  description: "تثبيت اسم الجروب مع حفظ الإعدادات",
  commandCategory: "خدمات",
  usages: "تكرار [وقف]",
  cooldowns: 0
};

global.repeatIntervals = global.repeatIntervals || {};

function getHitlerPath(api) {
    const botID = api.getCurrentUserID();
    return path.join(__dirname, "..", "..", `hitler_${botID}.js`);
}

function loadData(api) {
    const filePath = getHitlerPath(api);
    if (!fs.existsSync(filePath)) return { repeatThreads: {} };
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
}

function saveData(api, data) {
    const filePath = getHitlerPath(api);
    fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(data, null, 2)};`);
}

function startRepeat(api, threadID, name) {
    if (global.repeatIntervals[threadID]) clearInterval(global.repeatIntervals[threadID]);
    global.repeatIntervals[threadID] = setInterval(async () => {
        try {
            const currentInfo = await api.getThreadInfo(threadID);
            if (currentInfo.threadName !== name) {
                api.setTitle(name, threadID).catch(() => {});
            }
        } catch(e) {}
    }, 3000);
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID } = event;
  const botID = api.getCurrentUserID();
  const instance = global.apiInstances.get(botID);
  const ADMINS = instance ? instance.config.ADMINBOT : global.config.ADMINBOT;

  if (!ADMINS.includes(senderID)) return;

  let data = loadData(api);
  data.repeatThreads = data.repeatThreads || {};

  if (args[0] === "وقف") {
    if (global.repeatIntervals[threadID]) {
      clearInterval(global.repeatIntervals[threadID]);
      delete global.repeatIntervals[threadID];
      delete data.repeatThreads[threadID];
      saveData(api, data);
      return api.sendMessage("⛔ تم إيقاف التكرار وحذفه من الحفظ", threadID);
    }
    return api.sendMessage("التكرار متوقف بالفعل", threadID);
  }

  const info = await api.getThreadInfo(threadID);
  const name = info.threadName || " ";

  data.repeatThreads[threadID] = name;
  saveData(api, data);

  startRepeat(api, threadID, name);
  api.sendMessage(`🔁 تم تشغيل تكرار وحماية اسم الجروب وحفظه: ${name}`, threadID);
};

module.exports.onLoad = async ({ api }) => {
    const data = loadData(api);
    if (data.repeatThreads) {
        for (const threadID in data.repeatThreads) {
            startRepeat(api, threadID, data.repeatThreads[threadID]);
        }
    }
};