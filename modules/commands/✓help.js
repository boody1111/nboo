const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "انس × تعديل اليكسي",
  description: "قائمة أوامر البوت",
  commandCategory: "نظام",
  usages: "",
  cooldowns: 5
};

// ===== إعدادات الصورة =====
const CACHE_DIR = path.join(__dirname, "cache");
const IMAGE_PATH = path.join(CACHE_DIR, "commands.jpg");
const IMAGE_URL = "https://i.ibb.co/pjH72sDx/c5bf9b4801ee89b2c9d56924a9357217-1.gif";

// ===== تحميل الصورة مرة واحدة =====
module.exports.onLoad = async () => {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (!fs.existsSync(IMAGE_PATH)) {
    try {
      const img = await axios.get(IMAGE_URL, { responseType: "arraybuffer" });
      fs.writeFileSync(IMAGE_PATH, img.data);
      console.log("[COMMANDS] Image cached successfully");
    } catch (e) {
      console.log("[COMMANDS] Failed to cache image");
    }
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;
  const commands = global.client.commands;

  let list = "";
  let index = 1;

  for (const [name, cmd] of commands) {
    list += `🔹🐺  𝟬${index} ┇ ${name}\n`;
    index++;
  }

  const body =
`〖بــوت اليـــــكسي 2026 الحربي🐺🇻🇪〗

${list}

━━━━━━━━━━━━━━━━━━
✨ تـــــــم تطويــــر البــــوت
💖 بكـــــل حــب من قبــــــل
👑 المـــز اربـــرت
━━━━━━━━━━━━━━━━━━`;

  const msg = {
    body,
    attachment: fs.existsSync(IMAGE_PATH)
      ? fs.createReadStream(IMAGE_PATH)
      : null
  };

  return api.sendMessage(msg, threadID, messageID);
};