const login = require('@dongdev/fca-unofficial');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const dashboard = require('./server');

// =====================
// ADMIN
// =====================
const ADMIN_ID = "100015392232954";

// =====================
// Hitler Data
// =====================
const hitlerSystem = require("./hitler");

global.client = { commands: new Map(), events: new Map() };
global.utils = { log: (msg, type = "INFO") => console.log(`[${type}] ${msg}`) };
global.data = {};
global.config = fs.readJSONSync(path.join(__dirname, 'config.json'));

// تشغيل السيرفر
dashboard.listen();

// نظام تشغيل حسابات متعددة
global.startNewAccount = function(appStatePath) {
    startBot(appStatePath);
};

// =====================
// Anti Crash
// =====================
process.on("unhandledRejection", (reason) =>
    console.error("[ANTI CRASH] Unhandled Rejection:", reason)
);
process.on("uncaughtException", (err) =>
    console.error("[ANTI CRASH] Uncaught Exception:", err)
);

// =====================
// تحميل الأوامر
// =====================
function loadCommands() {
    const commandPath = path.join(__dirname, 'modules', 'commands');
    if (!fs.existsSync(commandPath)) return;

    const files = fs.readdirSync(commandPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const filePath = path.join(commandPath, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (command?.config?.name) {
                global.client.commands.set(command.config.name, command);
                console.log(`[COMMAND] Loaded: ${command.config.name}`);
            }
        } catch (e) {
            console.error(`[COMMAND ERROR] ${file}`, e);
        }
    }
}

// =====================
// تحميل الصور
// =====================
async function getImage(localPath, url) {
    if (!fs.existsSync(path.dirname(localPath))) {
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
    }
    if (!fs.existsSync(localPath)) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(localPath, res.data);
            console.log(`[IMAGE] Downloaded ${localPath}`);
        } catch (e) {
            console.error(`[IMAGE ERROR] ${url}`, e);
        }
    }
    return localPath;
}

// =====================
// تشغيل البوت
// =====================
function startBot(appStatePath = path.join(__dirname, 'appstate.json')) {

    if (!fs.existsSync(appStatePath)) {
        console.log("⚠️ انتظار إضافة حساب من الواجهة...");
        return;
    }

    loadCommands();

    const appState = fs.readJSONSync(appStatePath);

    login({ appState }, async (err, api) => {

        if (err) {
            console.error("[LOGIN ERROR]", err);
            return;
        }

        api.setOptions({
            ...global.config.FCAOption,
            listenEvents: true,
            selfListen: true,
            forceLogin: true
        });
        console.log("✅ تم تسجيل الدخول بنجاح في فيسبوك");
        dashboard.connectedAccounts.push({ id: api.getCurrentUserID(), time: new Date().toLocaleString() });

        // =====================
        // onLoad
        // =====================
        for (const [, command] of global.client.commands) {

            if (typeof command.onLoad === "function") {

                try {
                    await command.onLoad({ api });
                    console.log(`[ONLOAD] ${command.config.name}`);

                } catch (e) {
                    console.error(`[ONLOAD ERROR] ${command.config.name}`, e);
                }
            }
        }

        // =====================
        // Images
        // =====================
        const welcomePath = await getImage(
            path.join(__dirname, 'cache', 'welcome.gif'),
            'https://i.ibb.co/ynZXVMbd/991b35349a4ada4789c8d9dcf591a095.gif'
        );

        const goodbyePath = await getImage(
            path.join(__dirname, 'cache', 'goodbye.gif'),
            'https://i.ibb.co/nMs8yVQX/0de98223fe2d872a7c2423c67f41cc80.gif'
        );

        // =====================
        // handleCommand
        // =====================
        const handleCommand = require('./includes/handle/handleCommand')({
            api,

            Users: {
                getData: async () => ({}),
                getInfo: async () => ({ name: "User" })
            },

            Threads: {
                getData: async () => ({}),
                getInfo: async () => ({ adminIDs: [] })
            },

            Currencies: {
                get: async () => 0,
                set: async () => {},
                increaseMoney: async () => {}
            }
        });

        // =====================
        // MQTT
        // =====================
        api.listenMqtt(async (err, event) => {

            if (err) {
                console.error("[MQTT ERROR]", err);
                return;
            }

            if (!event) return;

            try {

                const botID = api.getCurrentUserID();
                const threadID = event.threadID;

                // =====================
                // ADMIN LOCK SYSTEM
                // =====================
                if (event.body) {

                    // قفل
                    if (event.body === "تشغيل" && event.senderID === ADMIN_ID) {

                        hitlerSystem.data.botLock = true;
                        hitlerSystem.save();

                        return api.sendMessage("🔒 تم قفل البوت (أدمن فقط)", threadID);
                    }

                    // فتح
                    if (event.body === "ايقاف" && event.senderID === ADMIN_ID) {

                        hitlerSystem.data.botLock = false;
                        hitlerSystem.save();

                        return api.sendMessage("🔓 تم فتح البوت للجميع", threadID);
                    }
                }

                // منع غير الأدمن وقت القفل
                if (hitlerSystem.data.botLock && event.senderID !== ADMIN_ID) {
                    return;
                }

                // =====================
                // دخول البوت
                // =====================
                if (event.logMessageType === "log:subscribe") {

                    const addedIDs = event.logMessageData.addedParticipants.map(p => p.userFbId);

                    if (addedIDs.includes(botID)) {

                        const threadInfo = await api.getThreadInfo(threadID);

                        await api.changeNickname("[ . ] • ALIX BOT", threadID, botID);

                        const msg = `
   ✨══════════ 2026 ══════════✨
   🎉 مرحباً بك في الكروب: 🔥 \${threadInfo.threadName} 🔥
   🧑‍🤝‍🧑 عدد الأعضاء: \${threadInfo.participantIDs.length}
   🆔 Thread ID: \${threadID}
                        `;

                        await api.sendMessage(
                            {
                                body: msg,
                                attachment: fs.createReadStream(welcomePath)
                            },
                            threadID
                        );
                    }
                }

                // =====================
                // خروج عضو
                // =====================
                if (event.logMessageType === "log:unsubscribe") {

                    const leftID = event.logMessageData.leftParticipantFbId;

                    if (leftID === botID) return;

                    const info = await api.getUserInfo(leftID);

                    const name = info[leftID]?.name || "عضو";

                    await api.sendMessage(
                        {
                            body: `💔 \${name} غادر الكروب`,
                            attachment: fs.createReadStream(goodbyePath)
                        },
                        threadID
                    );
                }

                // =====================
                // Commands
                // =====================
                await handleCommand({ api, event });

            } catch (e) {

                console.error("[HANDLE ERROR]", e);
            }
        });

        console.log("🚀 تم تشغيل البوت بنجاح وهو الآن جاهز للعمل");
    });
}

// تشغيل الحساب الأساسي إن وجد
startBot();
