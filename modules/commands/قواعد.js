const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "القوانين",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "عمر × تعديل اليكسي",
  description: "إدارة قوانين المجموعة",
  commandCategory: "مسؤولي المجموعات",
  usages: "القوانين [اضف/حذف/قائمة]",
  cooldowns: 5
};

const DATA_PATH = path.join(__dirname, "cache", "rules.json");

// =====================
// onLoad
// =====================
module.exports.onLoad = () => {
  const dir = path.join(__dirname, "cache");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]", "utf-8");
};

// =====================
// run
// =====================
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  let data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  let threadData = data.find(t => t.threadID == threadID);

  if (!threadData) {
    threadData = { threadID, rules: [] };
    data.push(threadData);
  }

  const action = args[0];
  const content = args.slice(1).join(" ");

  // === تحقق أدمن ===
  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(u => u.id == senderID);

  // =====================
  // إضافة قانون
  // =====================
  if (action === "اضف") {
    if (!isAdmin)
      return api.sendMessage("❌ الأمر للمشرفين فقط", threadID, messageID);

    if (!content)
      return api.sendMessage("⚠️ اكتب القانون بعد الأمر", threadID, messageID);

    content.split("\n").forEach(rule => {
      if (rule.trim()) threadData.rules.push(rule.trim());
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return api.sendMessage("✅ تم إضافة القانون بنجاح", threadID, messageID);
  }

  // =====================
  // عرض القوانين
  // =====================
  if (action === "قائمة" || action === "all" || !action) {
    if (threadData.rules.length === 0)
      return api.sendMessage("📭 لا توجد قوانين حالياً", threadID, messageID);

    let msg = "📜 قوانين المجموعة 📜\n━━━━━━━━━━━━━━\n";
    threadData.rules.forEach((r, i) => {
      msg += `🔹 ${i + 1} ┇ ${r}\n`;
    });
    msg += "\n⚠️ مخالفة القوانين = طرد";

    return api.sendMessage(msg, threadID, messageID);
  }

  // =====================
  // حذف قانون
  // =====================
  if (action === "حذف" || action === "مسح") {
    if (!isAdmin)
      return api.sendMessage("❌ الأمر للمشرفين فقط", threadID, messageID);

    if (content === "all") {
      threadData.rules = [];
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
      return api.sendMessage("🗑️ تم حذف جميع القوانين", threadID, messageID);
    }

    const index = parseInt(content);
    if (isNaN(index) || index < 1 || index > threadData.rules.length)
      return api.sendMessage("⚠️ رقم قانون غير صحيح", threadID, messageID);

    threadData.rules.splice(index - 1, 1);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return api.sendMessage(`🗑️ تم حذف القانون رقم ${index}`, threadID, messageID);
  }

  // =====================
  // مساعدة
  // =====================
  return api.sendMessage(
`📘 استخدام أمر القوانين:

القوانين
القوانين قائمة
القوانين اضف <نص القانون>
القوانين حذف <رقم>
القوانين حذف all`,
    threadID,
    messageID
  );
};