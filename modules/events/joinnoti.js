module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "Mirai Team",
  description: "Thông báo bot hoặc người vào nhóm",
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;

  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const { createReadStream, existsSync } = global.nodemodule["fs-extra"];
    const path = require("path");
    const welcomeImagePath = path.join(__dirname, "cache", "bot_welcome.png");
    
    api.changeNickname(`[ . ] • ALIX BOT`, threadID, api.getCurrentUserID());
    
    const activationMessage = `‎✿——————————————✿
تـــــــــــــــم
تفعـــــيل بــــــــوت اليكـــــسي ✅
اتمنـــــــــــــي ان تســــــــتمعوا 😼💮
شكــــــــــــرا علي استخدامــــــــي 🕷
الافضـــــــــل حتي الان❤🩸
✿——————————————✿`;
    
    if (existsSync(welcomeImagePath)) {
      api.sendMessage({
        body: activationMessage,
        attachment: createReadStream(welcomeImagePath)
      }, threadID);
    } else {
      api.sendMessage(activationMessage, threadID);
    }
  } else {
    try {
      const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
      const { threadName, participantIDs } = await api.getThreadInfo(threadID);

      const nameArray = [];
      const mentions = [];
      const memLength = [];
      let i = 0;

      for (const id in event.logMessageData.addedParticipants) {
        const userName = event.logMessageData.addedParticipants[id].fullName;
        nameArray.push(userName);
        mentions.push({ tag: userName, id });
        memLength.push(participantIDs.length - i++);

        if (!global.data.allUserID.includes(id)) {
          await Users.createData(id, { name: userName, data: {} });
          global.data.userName.set(id, userName);
          global.data.allUserID.push(id);
        }
      }
      memLength.sort((a, b) => a - b);

      const threadData = global.data.threadData.get(parseInt(threadID)) || {};
      let msg = "";

      if (typeof threadData.customJoin === "undefined") {
        msg = `✿——————————————✿
نــــــــــــورت الكروب يا جميل 🥹❤ {name}
اســــــم الكروب 🙄✨: {threadName}
انت القــــــــمر رقم : {soThanhVien} في الكــــروب 😝🖤
تمـــــت اضـــــــافتك بواسطــــة العســــــــل ✨😉 {author}

نــــــــورت الكـــروب/الفـــــــريق يا قمر  💝

بعض الشروط اللذي يجب انت تعرفها 🖤✨

ممنــــــــــوع الاسبام👁
ممنـــــــــوع السب والعراك🕷
ممنــــــــــوع الدخول لبنت/ولــــــــد خـــاص🌹
ممنــــــــــوع فتح حورات سياسيه او مقــارنات 🖤✨

ممنوع قـــــــول كــــــــلام منـــــــحرف😡👊🏻


لتريقـــــــــتك🥹❤: 

التــــــــفاعل✨💋
اضــــــــافة اعضاء نشطه🔥☁
احترام الكروب والادمن 🌃
افـــــادة الاعضاء وتعليـــم وتصـميم واثبات الفارق 🕷🌹


بالنـــــــــــهاية: 
نــــــــــــــــورت الكروب/الفريــــــــق وتشـــــــرفنا بوجـــــــــــــودك معنا ونتــــــــمني ان تستــــمع ونستـــــــمتع معا


المطـــــــــــــــــــــور:اليـــــــــكسي اربـــــــــــــرت 👨🏻‍🎓 
✿——————————————✿`;
      } else {
        msg = threadData.customJoin;
      }

      const getData = await Users.getData(event.author);
      const nameAuthor = typeof getData.name === "undefined" ? "link join" : getData.name;

      const time = require("moment-timezone").tz("Asia/Ho_Chi_Minh");
      const gio = time.format("HH");
      const moment = require("moment-timezone");
      const bok = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY" || "HH:mm:ss");

      let get = "";
      if (gio >= 5) get = "𝐁𝐮𝐨̂̉𝐢 𝐒𝐚́𝐧𝐠";
      if (gio >= 11) get = "𝐁𝐮𝐨̂̉𝐢 𝐓𝐫𝐮̛𝐚";
      if (gio >= 14) get = "𝐁𝐮𝐨̂̉𝐢 𝐂𝐡𝐢Ề̀u";
      if (gio >= 19) get = "𝐁𝐮𝐨̂̉𝐢 𝐓𝐨̂́𝐢";

      msg = msg
        .replace(/\{name}/g, nameArray.join(", "))
        .replace(/\{type}/g, memLength.length > 1 ? "𝐜𝐚́𝐜 𝐛𝐚̣𝐧" : "𝐛𝐚̣𝐧")
        .replace(/\{soThanhVien}/g, memLength.join(", "))
        .replace(/\{threadName}/g, threadName)
        .replace(/\{get}/g, get)
        .replace(/\{author}/g, nameAuthor)
        .replace(/\{bok}/g, bok);

      const path = require("path");
      const pathGif = path.join(__dirname, "cache", "joinGif", `${1}.mp5`);

      if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
      } else {
        formPush = { body: msg, mentions };
      }

      if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
      } else {
        formPush = { body: msg, mentions };
      }

      return api.sendMessage(formPush, threadID);
    } catch (e) {
      console.log(e);
    }
  }
};
