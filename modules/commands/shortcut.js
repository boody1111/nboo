const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
	name: "shortcut",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Mirai Team",
	description: "Thêm phím tắt cho nhóm của bạn",
	commandCategory: "group",
	usages: "[add/remove/all/list] [keyword] [content]",
	cooldowns: 5
};

module.exports.onLoad = function () {
    const dirPath = path.join(__dirname, "cache", "shortcut");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const pathFile = path.join(__dirname, "cache", "shortcut", threadID + ".json");
    
    if (!fs.existsSync(pathFile)) fs.writeJSONSync(pathFile, []);
    const data = fs.readJSONSync(pathFile);

    if (args[0] == "add") {
        const keyword = args[1];
        const content = args.slice(2).join(" ");
        if (!keyword || !content) return api.sendMessage("Vui lòng nhập từ khóa và nội dung", threadID, messageID);
        data.push({ keyword, content });
        fs.writeJSONSync(pathFile, data);
        return api.sendMessage("Đã thêm phím tắt: " + keyword, threadID, messageID);
    }
    
    if (args[0] == "list" || args[0] == "all") {
        if (data.length == 0) return api.sendMessage("Không có phím tắt nào", threadID, messageID);
        let msg = "Danh sách phím tắt:\n";
        data.forEach((item, index) => msg += (index + 1) + ". " + item.keyword + " -> " + item.content + "\n");
        return api.sendMessage(msg, threadID, messageID);
    }

    return api.sendMessage("Sử dụng: .shortcut add [từ khóa] [nội dung] hoặc .shortcut list", threadID, messageID);
}

module.exports.handleEvent = async function ({ event, api }) {
    const { threadID, messageID, body } = event;
    if (!body) return;
    const pathFile = path.join(__dirname, "cache", "shortcut", threadID + ".json");
    if (!fs.existsSync(pathFile)) return;
    const data = fs.readJSONSync(pathFile);
    const found = data.find(item => item.keyword == body);
    if (found) return api.sendMessage(found.content, threadID, messageID);
}
