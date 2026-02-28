const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تكرار",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "تثبيت اسم الجروب",
  commandCategory: "خدمات",
  usages: "تكرار",
  cooldowns: 0
};

const dataPath = path.join(__dirname, "..", "..", "hitler.js");
const ADMINID = "61587844010188";

global.repeatIntervals = global.repeatIntervals || {};

function loadData() {
  delete require.cache[require.resolve(dataPath)];
  return require(dataPath);
}

function saveData(d) {
  fs.writeFileSync(dataPath, `module.exports = ${JSON.stringify(d, null, 2)};`);
}

async function startRepeat(api, threadID) {
  const info = await api.getThreadInfo(threadID);
  const name = info.threadName || " ";

  let d = loadData();
  d.repeat = d.repeat || {};
  if (!d.repeat[threadID]) d.repeat[threadID] = name;
  saveData(d);

  if (global.repeatIntervals[threadID]) clearInterval(global.repeatIntervals[threadID]);
  global.repeatIntervals[threadID] = setInterval(() => {
    api.setTitle(d.repeat[threadID], threadID).catch(() => {});
  }, 3000);
}

function stopRepeat(threadID) {
  if (global.repeatIntervals[threadID]) {
    clearInterval(global.repeatIntervals[threadID]);
    delete global.repeatIntervals[threadID];
  }
  let d = loadData();
  if (d.repeat) delete d.repeat[threadID];
  saveData(d);
}

module.exports.run = async ({ api, event }) => {
  const { threadID, senderID, body } = event;
  if (senderID !== ADMINID) return;

  if (body === "تكرار وقف") {
    stopRepeat(threadID);
    return api.sendMessage("⛔ تم إيقاف التكرار", threadID);
  }

  await startRepeat(api, threadID);
  api.sendMessage("🔁 تم تشغيل تكرار اسم الجروب", threadID);
};

module.exports.onLoad = async ({ api }) => {
  const d = loadData();
  if (!d.repeat) return;
  for (const threadID in d.repeat) startRepeat(api, threadID);
};