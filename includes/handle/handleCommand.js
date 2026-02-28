const fs = require('fs-extra');
const path = require('path');

module.exports = function({ api, Users, Threads, Currencies }) {
    return async function({ api, event }) {
        const { threadID, messageID, body, senderID } = event;
        
        // تسجيل الرسائل الواردة للتأكد من وصولها
        console.log(`[MESSAGE] From ${senderID}: ${body}`);

        if (!body) return;
        
        // التحقق من وجود البادئة (Prefix)
        const prefix = global.config.PREFIX || ".";
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = global.client.commands.get(commandName);

        if (!command) {
            console.log(`[COMMAND] Not found: ${commandName}`);
            return;
        }

        try {
            const getText = (key, ...args) => {
                const lang = global.config.language || "vi";
                if (!command.languages || !command.languages[lang] || !command.languages[lang][key]) return key;
                let text = command.languages[lang][key];
                for (let i = 0; i < args.length; i++) {
                    const regEx = new RegExp(`%${i + 1}`, 'g');
                    text = text.replace(regEx, args[i]);
                }
                return text;
            };
            await command.run({ api, event, args, Users, Threads, Currencies, getText });
            console.log(`[COMMAND] Executed: ${commandName}`);
        } catch (error) {
            console.error(`[COMMAND ERROR] ${commandName}:`, error);
            api.sendMessage(`❌ حدث خطأ أثناء تشغيل الأمر: ${error.message}`, threadID, messageID);
        }
    };
};