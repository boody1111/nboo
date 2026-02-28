const login = require('@dongdev/fca-unofficial');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const dashboard = require('./server');
const hitlerSystem = require("./hitler");

// Store all active API instances with their configs
global.apiInstances = new Map();

global.client = { commands: new Map(), events: new Map() };
global.utils = { log: (msg, type = "INFO") => console.log(`[${type}] ${msg}`) };
global.data = {
    threadData: new Map(),
    userName: new Map(),
    userStats: new Map(),
    userData: new Map()
};
global.config = fs.readJSONSync(path.join(__dirname, 'config.json'));
global.moduleData = {};

dashboard.listen();

global.startNewAccount = function(appStatePath, configPath) { 
    startBot(appStatePath, configPath); 
};

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

function startBot(appStatePath = path.join(__dirname, 'appstate.json'), configPath = path.join(__dirname, 'config.json')) {
    if (!fs.existsSync(appStatePath)) return;
    loadCommands();
    let appState, botConfig;
    try {
        appState = fs.readJSONSync(appStatePath);
        botConfig = fs.existsSync(configPath) ? fs.readJSONSync(configPath) : global.config;
    } catch (e) {
        return console.error("[CONFIG ERROR]", e);
    }

    login({ appState }, async (err, api) => {
        if (err) return console.error("[LOGIN ERROR]", err);
        
        const botID = api.getCurrentUserID();
        global.apiInstances.set(botID, { api, config: botConfig });
        
        api.setOptions({ ...botConfig.FCAOption, listenEvents: true, selfListen: true, forceLogin: true });
        
        if (!dashboard.connectedAccounts.find(acc => acc.id === botID)) {
            dashboard.connectedAccounts.push({ 
                id: botID, 
                time: new Date().toLocaleString(),
                appStatePath: appStatePath,
                configPath: configPath
            });
        }

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

        for (const [, command] of global.client.commands) {
            if (typeof command.onLoad === "function") {
                try { await command.onLoad({ api }); } catch (e) { console.error(`[ONLOAD ERROR] ${command.config.name}`, e); }
            }
        }

        const welcomePath = await getImage(path.join(__dirname, 'cache', 'welcome.gif'), 'https://i.ibb.co/ynZXVMbd/991b35349a4ada4789c8d9dcf591a095.gif');
        const Currencies = { get: async () => 0, set: async () => {}, increaseMoney: async () => {}, getData: async () => ({ exp: 0, money: 0 }) };
        
        const handleCommand = require('./includes/handle/handleCommand')({
            api,
            Users: { getData: async () => ({}), getInfo: async () => ({ name: "User" }), getNameUser: async () => "User" },
            Threads: { getData: async () => ({}), getInfo: async () => ({ adminIDs: [] }), setData: async () => ({}) },
            Currencies
        });

        api.listenMqtt(async (err, event) => {
            if (err || !event) return;
            try {
                const threadID = event.threadID;
                const body = event.body;
                const senderID = event.senderID;
                const ADMINS = botConfig.ADMINBOT;

                if (body && body === "تشغيل" && ADMINS.includes(senderID)) {
                    hitlerSystem.data.botLock = true; hitlerSystem.save();
                    return api.sendMessage("🔒 تم قفل البوت (أدمن فقط)", threadID);
                }
                if (body && body === "ايقاف" && ADMINS.includes(senderID)) {
                    hitlerSystem.data.botLock = false; hitlerSystem.save();
                    return api.sendMessage("🔓 تم فتح البوت للجميع", threadID);
                }
                
                if (hitlerSystem.data.botLock && !ADMINS.includes(senderID)) return;

                if (event.logMessageType === "log:subscribe") {
                    const addedIDs = event.logMessageData.addedParticipants.map(p => p.userFbId);
                    if (addedIDs.includes(botID)) {
                        await api.changeNickname(`[ ${botConfig.PREFIX} ] • ${botConfig.BOTNAME}`, threadID, botID);
                        api.sendMessage({ body: `تم تفعيل البوت باسم: ${botConfig.BOTNAME}`, attachment: fs.createReadStream(welcomePath) }, threadID);
                    }
                }
                
                for (const [, command] of global.client.commands) {
                    if (typeof command.handleEvent === "function") {
                        try {
                            await command.handleEvent({ 
                                event, api, Users: {}, Threads: {}, Currencies,
                                getText: (key) => key
                            });
                        } catch (e) {}
                    }
                }

                await handleCommand({ api, event });
            } catch (e) { console.error("[LISTEN ERROR]", e); }
        });
        console.log(`🚀 البوت [${botID}] جاهز (الاسم: ${botConfig.BOTNAME})`);
    });
}

const files = fs.readdirSync(__dirname);
files.forEach(file => {
    if (file.startsWith("appstate_") && file.endsWith(".json")) {
        const id = file.replace("appstate_", "").replace(".json", "");
        const configPath = path.join(__dirname, `config_${id}.json`);
        startBot(path.join(__dirname, file), configPath);
    }
});
if (fs.existsSync(path.join(__dirname, 'appstate.json'))) {
    startBot();
}