module.exports.config = {
  name: "هتلر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "وســـــــــكي",
  description: "تغيير كنيات الأعضاء بسرعة",
  commandCategory: "إدارة",
  usages: "[الكنية]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const fs = require("fs-extra");
  const gifPath = "attached_assets/e994d6d69dd306db4c0762cbc5176ad1_1766843890216.gif";
  
  if (!global.hitlerNick) global.hitlerNick = new Map();
  
  if (global.hitlerNick.has(threadID)) {
    global.hitlerNick.delete(threadID);
    const msg = { body: "تـــــم إيقاف تغيير الكنيات! ✅" };
    if (fs.existsSync(gifPath)) msg.attachment = fs.createReadStream(gifPath);
    return api.sendMessage(msg, threadID, messageID);
  }

  const nickname = args.join(" ");
  if (!nickname) return api.sendMessage("يرجى إدخال الكنية المطلوبة!", threadID, messageID);

  const msg = { body: `جـاري تـغيـير كـنيات الأعـضاء إلـى: ${nickname}... ⏳` };
  if (fs.existsSync(gifPath)) msg.attachment = fs.createReadStream(gifPath);
  api.sendMessage(msg, threadID);

  global.hitlerNick.set(threadID, true);

  const threadInfo = await api.getThreadInfo(threadID);
  const participantIDs = threadInfo.participantIDs;

  for (const uid of participantIDs) {
    if (!global.hitlerNick.has(threadID)) break;
    api.changeNickname(nickname, threadID, uid);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  global.hitlerNick.delete(threadID);
  const finalMsg = { body: "تـــــم تـغـيير جـمـيع الكـنيات بـنـجـاح! ✨" };
  if (fs.existsSync(gifPath)) finalMsg.attachment = fs.createReadStream(gifPath);
  return api.sendMessage(finalMsg, threadID);
};

module.exports.handleEvent = async ({ api, event }) => {
  if (event.body && event.body.toLowerCase() === "هرب") {
    if (global.hitlerNick && global.hitlerNick.has(event.threadID)) {
      global.hitlerNick.delete(event.threadID);
      const fs = require("fs-extra");
      const gifPath = "attached_assets/8e3d4c12318a61e849a40125bb82203e_1766842987040.gif";
      const msg = { body: "تـــــم إيقاف تـغـيير الـكـنـيـات! ✅" };
      if (fs.existsSync(gifPath)) msg.attachment = fs.createReadStream(gifPath);
      return api.sendMessage(msg, event.threadID);
    }
  }
};
