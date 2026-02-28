module.exports.config = {
  name: "adminPromotion",
  eventType: ["log:thread-admins"],
  version: "1.0.0",
  credits: "اليكسي",
  description: "اشعار عند منح البوت صلاحيات الادمن"
};

module.exports.run = async function({ api, event }) {
  const { threadID, logMessageData, logMessageType } = event;
  
  if (logMessageType === "log:thread-admins") {
    const { TARGET_ID } = logMessageData;
    
    if (TARGET_ID === api.getCurrentUserID()) {
      api.sendMessage("شكرا علي الادمن ✅", threadID);
    }
  }
};
