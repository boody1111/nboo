const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تكرار",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "اليكسي",
  description: "تثبيت اسم الجروب وحمايته",
  commandCategory: "خدمات",
  usages: "تكرار [وقف]",
  cooldowns: 0
};

global.repeatIntervals = global.repeatIntervals || {};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID } = event;
  const botID = api.getCurrentUserID();
  const botInstance = global.apiInstances.get(botID);
  const ADMINS = botInstance ? botInstance.config.ADMINBOT : global.config.ADMINBOT;

  if (!ADMINS.includes(senderID)) return;

  if (args[0] === "وقف") {
    if (global.repeatIntervals[threadID]) {
      clearInterval(global.repeatIntervals[threadID]);
      delete global.repeatIntervals[threadID];
      return api.sendMessage("⛔ تم إيقاف التكرار والحماية", threadID);
    }
    return api.sendMessage("التكرار متوقف بالفعل", threadID);
  }

  const info = await api.getThreadInfo(threadID);
  const name = info.threadName || " ";

  if (global.repeatIntervals[threadID]) clearInterval(global.repeatIntervals[threadID]);
  
  global.repeatIntervals[threadID] = setInterval(async () => {
    const currentInfo = await api.getThreadInfo(threadID);
    if (currentInfo.threadName !== name) {
        api.setTitle(name, threadID).catch(() => {});
    }
  }, 3000);

  api.sendMessage(`🔁 تم تشغيل تكرار وحماية اسم الجروب: ${name}`, threadID);
};