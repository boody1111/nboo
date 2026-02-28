module.exports.config = {
    name: "fishing",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Tham gia câu cá ngay trên chính nhóm của bạn",
    commandCategory: "game-mp",
    usages: "help",
    cooldowns: 0,
    dependencies: {
        "fs-extra": "",
        "path": "",
        "moment-timezone": "",
        "semver": ""
    }
};

module.exports.onLoad = async function () {
    const fs = require("fs-extra");
    const path = require("path");
    const dirData = path.join(__dirname, "cache", "fishing");
    if (!fs.existsSync(dirData)) fs.mkdirSync(dirData, { recursive: true });
};

module.exports.run = async function ({ api, event, args, Users, Currencies, getText }) {
    // Simplified version for compatibility
    return api.sendMessage("Fishing command is being updated for compatibility.", event.threadID);
};
