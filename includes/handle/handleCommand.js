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
            await command.run({ api, event, args, Users, Threads, Currencies });
            console.log(`[COMMAND] Executed: ${commandName}`);
        } catch (error) {
            console.error(`[COMMAND ERROR] ${commandName}:`, error);
            api.sendMessage(`❌ حدث خطأ أثناء تشغيل الأمر: ${error.message}`, threadID, messageID);
        }
    };
};