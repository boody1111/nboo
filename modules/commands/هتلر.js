module.exports.config = {
  name: "هتلر",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "اليكسي",
  description: "تغيير كنيات الأعضاء بسرعة مع حماية",
  commandCategory: "إدارة",
  usages: "[الكنية]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const botID = api.getCurrentUserID();
  const botInstance = global.apiInstances.get(botID);
  const ADMINS = botInstance ? botInstance.config.ADMINBOT : global.config.ADMINBOT;

  if (!ADMINS.includes(senderID)) return;
  
  if (!global.hitlerNick) global.hitlerNick = new Map();
  
  if (args[0] === "وقف") {
    global.hitlerNick.delete(threadID);
    return api.sendMessage("تـــــم إيقاف تغيير الكنيات! ✅", threadID, messageID);
  }

  const nickname = args.join(" ");
  if (!nickname) return api.sendMessage("يرجى إدخال الكنية المطلوبة!", threadID, messageID);

  api.sendMessage(`جـاري تـغيـير كـنيات الأعـضاء إلـى: ${nickname}... ⏳`, threadID);
  global.hitlerNick.set(threadID, { nickname, active: true });

  const threadInfo = await api.getThreadInfo(threadID);
  const participantIDs = threadInfo.participantIDs;

  for (const uid of participantIDs) {
    if (!global.hitlerNick.has(threadID)) break;
    api.changeNickname(nickname, threadID, uid).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 2000)); // توقف ثانيتين كما طلب المستخدم
  }

  global.hitlerNick.delete(threadID);
  return api.sendMessage("تـــــم تـغـيير جـمـيع الكـنيات بـنـجـاح مع الحماية! ✨", threadID);
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