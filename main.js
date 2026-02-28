const login = require('@dongdev/fca-unofficial');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const dashboard = require('./server');
const ADMIN_ID = "100015392232954";
const hitlerSystem = require("./hitler");

global.client = { commands: new Map(), events: new Map() };
global.utils = { log: (msg, type = "INFO") => console.log(`[${type}] ${msg}`) };
global.data = {};
global.config = fs.readJSONSync(path.join(__dirname, 'config.json'));
global.moduleData = {};

dashboard.listen();

global.startNewAccount = function(appStatePath) { startBot(appStatePath); };

process.on("unhandledRejection", (reason) => console.error("[ANTI CRASH] Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => console.error("[ANTI CRASH] Uncaught Exception:", err));

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
        } catch (e) { console.error(`[COMMAND ERROR] ${file}`, e); }
    }
}

async function getImage(localPath, url) {
    if (!fs.existsSync(path.dirname(localPath))) fs.mkdirSync(path.dirname(localPath), { recursive: true });
    if (!fs.existsSync(localPath)) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(localPath, res.data);
        } catch (e) { console.error(`[IMAGE ERROR] ${url}`, e); }
    }
    return localPath;
}

function startBot(appStatePath = path.join(__dirname, 'appstate.json')) {
    if (!fs.existsSync(appStatePath)) return;
    loadCommands();
    const appState = fs.readJSONSync(appStatePath);
    login({ appState }, async (err, api) => {
        if (err) return console.error("[LOGIN ERROR]", err);
        api.setOptions({ ...global.config.FCAOption, listenEvents: true, selfListen: true, forceLogin: true });
        dashboard.connectedAccounts.push({ id: api.getCurrentUserID(), time: new Date().toLocaleString() });

        global.configModule = {};
        for (const [, command] of global.client.commands) {
            if (command.config.envConfig) global.configModule[command.config.name] = command.config.envConfig;
        }
        
        global.nodemodule = {
            "fs-extra": require("fs-extra"), "axios": require("axios"), "path": require("path"),
            "request": require("request"), "cheerio": require("cheerio"), "moment-timezone": require("moment-timezone"), "semver": require("semver")
        };
        global.resort = global.nodemodule;
        global.require = require;
        global.__dirname = __dirname;
        global.global = global;

        const handlesPath = path.join(__dirname, 'modules', 'handles');
        if (!fs.existsSync(handlesPath)) fs.mkdirSync(handlesPath, { recursive: true });
        const smPath = path.join(handlesPath, 'sendMessage.js');
        if (!fs.existsSync(smPath)) fs.writeFileSync(smPath, `module.exports = function(api) { return function(message, threadID, callback, messageID) { return api.sendMessage(message, threadID, callback, messageID); }; };`);

        for (const [, command] of global.client.commands) {
            if (typeof command.onLoad === "function") {
                try { await command.onLoad({ api }); } catch (e) { console.error(`[ONLOAD ERROR] ${command.config.name}`, e); }
            }
        }

        const welcomePath = await getImage(path.join(__dirname, 'cache', 'welcome.gif'), 'https://i.ibb.co/ynZXVMbd/991b35349a4ada4789c8d9dcf591a095.gif');
        const handleCommand = require('./includes/handle/handleCommand')({
            api,
            Users: { getData: async () => ({}), getInfo: async () => ({ name: "User" }) },
            Threads: { getData: async () => ({}), getInfo: async () => ({ adminIDs: [] }) },
            Currencies: { get: async () => 0, set: async () => {}, increaseMoney: async () => {} }
        });

        api.listenMqtt(async (err, event) => {
            if (err || !event) return;
            try {
                const botID = api.getCurrentUserID();
                const threadID = event.threadID;
                if (event.body) {
                    if (event.body === "تشغيل" && event.senderID === ADMIN_ID) {
                        hitlerSystem.data.botLock = true; hitlerSystem.save();
                        return api.sendMessage("🔒 تم قفل البوت (أدمن فقط)", threadID);
                    }
                    if (event.body === "ايقاف" && event.senderID === ADMIN_ID) {
                        hitlerSystem.data.botLock = false; hitlerSystem.save();
                        return api.sendMessage("🔓 تم فتح البوت للجميع", threadID);
                    }
                }
                if (hitlerSystem.data.botLock && event.senderID !== ADMIN_ID) return;

                if (event.logMessageType === "log:subscribe") {
                    const addedIDs = event.logMessageData.addedParticipants.map(p => p.userFbId);
                    if (addedIDs.includes(botID)) {
                        const threadInfo = await api.getThreadInfo(threadID);
                        await api.changeNickname("[ . ] • ALIX BOT", threadID, botID);
                        await api.sendMessage({ body: `مرحباً بك في الكروب: ${threadInfo.threadName}`, attachment: fs.createReadStream(welcomePath) }, threadID);
                    }
                }
                
                // Shortcut handling
                for (const [, command] of global.client.commands) {
                    if (typeof command.handleEvent === "function") {
                        await command.handleEvent({ event, api });
                    }
                }

                await handleCommand({ api, event });
            } catch (e) {}
        });
        console.log("🚀 البوت جاهز للعمل");
    });
}
startBot();
